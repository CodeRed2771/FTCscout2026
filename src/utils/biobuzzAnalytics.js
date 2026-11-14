// src/utils/biobuzzAnalytics.js

export const BIOBUZZ_POINTS = {
    LEAVE: 3,                 // AUTO only: robot leaves perimeter wall
    PARK: 5,                  // AUTO and/or TELEOP: partially in LOADING ZONE
    HIVE_TIP: 20,             // AUTO or TELEOP: bi-stable HIVE tips
    HIVE_RESIDUAL: 2,         // End of MATCH: elements remaining in upward CELL
    FLOWER_BOTTOM_NECTAR: 5,  // End of MATCH: lowest legal NECTAR of alliance color
    FLOWER_ELEMENT: 2,        // End of MATCH: each POLLEN/NECTAR in an owned FLOWER
    GARDEN_ELEMENT: 1,        // End of MATCH: each POLLEN/NECTAR in alliance GARDEN
};

// HIVE seesaw capacity before tipping (upward CELL starts with 3 pre-staged NECTAR)
const HIVE_TIP_THRESHOLD = 6;

// Physical heights (inches) for FLOWER legal volume between middle & top rings
const ELEMENT_HEIGHT_IN = { POLLEN: 2.8, NECTAR: 3.6 };
const MAX_FLOWER_STACK_IN = 19.6;

/**
 * Parses integer element counts cleanly.
 */
function parseCount(val) {
    const num = Number(val);
    return Number.isFinite(num) && num > 0 ? Math.floor(num) : 0;
}

/**
 * Parses mobility fields where -1 or 0 means not achieved, and > 0 awards official points.
 */
function parseMobilityPoints(val, officialPts) {
    if (val === 'Yes' || val === true) return officialPts;
    const num = Number(val);
    return Number.isFinite(num) && num > 0 ? officialPts : 0;
}

/**
 * Converts cycle lists (e.g. "0, 1, 1, 1, 1" or [0, 1, 1, 1, 1]) into elapsed match seconds.
 * - AUTO runs from 0s to 30s
 * - TELEOP runs from 30s to 150s
 */
function buildEventTimestamps(cycleInput, totalCount, period) {
    if (totalCount <= 0) return [];

    const startT = period === 'AUTO' ? 0 : 30;
    const endT = period === 'AUTO' ? 30 : 150;

    const rawList = Array.isArray(cycleInput)
        ? cycleInput
        : String(cycleInput ?? '').split(',');

    const rawNums = rawList
        .map((s) => (s === '' || s === null || s === undefined ? NaN : Number(String(s).trim())))
        .filter((n) => Number.isFinite(n) && n >= 0);

    const timestamps = [];

    if (rawNums.length > 0) {
        // Check if Teleop values are already absolute match timestamps (e.g. "45, 72, 118")
        const isAlreadyElapsed =
            period === 'TELEOP' &&
            rawNums[0] > 30 &&
            rawNums.every((v, i) => i === 0 || v >= rawNums[i - 1]);

        if (isAlreadyElapsed) {
            for (const v of rawNums) {
                timestamps.push(Math.max(startT, Math.min(endT, v)));
            }
        } else {
            // Accumulate cycle durations (0s registers immediately at period start)
            let cursor = startT;
            for (const duration of rawNums) {
                cursor = Math.min(endT, cursor + Math.max(0, duration));
                timestamps.push(cursor);
            }
        }
    }

    // Evenly distribute any remaining counted elements that lack cycle timestamps
    while (timestamps.length < totalCount) {
        const idx = timestamps.length + 1;
        const frac = idx / (totalCount + 1);
        timestamps.push(Number((startT + frac * (endT - startT)).toFixed(2)));
    }

    return timestamps.slice(0, totalCount);
}

/**
 * Normalizes one match scouting row into structured events + mobility points.
 */
function normalizeMatchRow(row) {
    const team = String(row['Team Number'] ?? '').trim();
    const location = String(row['Location'] ?? '').trim();
    const matchNumber = String(row['Match Number'] ?? '').trim();
    const rawAlliance = String(row['Alliance'] ?? '').trim().toUpperCase();
    const alliance = rawAlliance.startsWith('B') ? 'BLUE' : 'RED';

    const autoMobility =
        parseMobilityPoints(row['Auto Leave'], BIOBUZZ_POINTS.LEAVE) +
        parseMobilityPoints(row['Auto Park'], BIOBUZZ_POINTS.PARK);

    const teleopMobility = parseMobilityPoints(row['Teleop Park'], BIOBUZZ_POINTS.PARK);

    const categories = [
        {
            count: parseCount(row['Auto Hive Nectar']),
            cycles: row['Auto Cycles (Hive Nectar)'],
            period: 'AUTO',
            zone: 'HIVE',
            element: 'NECTAR',
        },
        {
            count: parseCount(row['Auto Hive Pollen']),
            cycles: row['Auto Cycles (Hive Pollen)'],
            period: 'AUTO',
            zone: 'HIVE',
            element: 'POLLEN',
        },
        {
            count: parseCount(row['Teleop Hive Nectar']),
            cycles: row['Teleop Cycles (Hive Nectar)'],
            period: 'TELEOP',
            zone: 'HIVE',
            element: 'NECTAR',
        },
        {
            count: parseCount(row['Teleop Hive Pollen']),
            cycles: row['Teleop Cycles (Hive Pollen)'],
            period: 'TELEOP',
            zone: 'HIVE',
            element: 'POLLEN',
        },
        {
            count: parseCount(row['Teleop Flower Nectar']),
            cycles: row['Teleop Cycles (Flower Nectar)'],
            period: 'TELEOP',
            zone: 'FLOWER',
            element: 'NECTAR',
        },
        {
            count: parseCount(row['Teleop Flower Pollen']),
            cycles: row['Teleop Cycles (Flower Pollen)'],
            period: 'TELEOP',
            zone: 'FLOWER',
            element: 'POLLEN',
        },
        {
            count: parseCount(row['Teleop Garden Nectar']),
            cycles: row['Teleop Cycles (Garden Nectar)'],
            period: 'TELEOP',
            zone: 'GARDEN',
            element: 'NECTAR',
        },
        {
            count: parseCount(row['Teleop Garden Pollen']),
            cycles: row['Teleop Cycles (Garden Pollen)'],
            period: 'TELEOP',
            zone: 'GARDEN',
            element: 'POLLEN',
        },
    ];

    const events = [];
    for (const cat of categories) {
        const tsList = buildEventTimestamps(cat.cycles, cat.count, cat.period);
        for (const ts of tsList) {
            events.push({
                ts,
                period: cat.period,
                zone: cat.zone,
                element: cat.element,
                robotId: team,
                alliance,
            });
        }
    }

    return {
        team,
        location,
        matchNumber,
        alliance,
        autoMobility,
        teleopMobility,
        events,
    };
}

/**
 * Simulates all scouted robots in a single match on a shared virtual field.
 */
export function simulateMatch(rawRows) {
    const rows = rawRows.map(normalizeMatchRow).filter((r) => r.team);
    const credits = {};

    for (const r of rows) {
        if (!credits[r.team]) {
            credits[r.team] = {
                team: r.team,
                alliance: r.alliance,
                autoMobility: 0,
                teleopMobility: 0,
                autoHive: 0,
                teleopHive: 0,
                hiveTipsAttributed: 0,
                flower: 0,
                garden: 0,
                total: 0,
            };
        }
        credits[r.team].autoMobility += r.autoMobility;
        credits[r.team].teleopMobility += r.teleopMobility;
    }

    const allEvents = rows.flatMap((r) => r.events).sort((a, b) => a.ts - b.ts);

    // 1. HIVE Simulation (per alliance)
    for (const alliance of ['RED', 'BLUE']) {
        const hiveEvents = allEvents.filter((e) => e.alliance === alliance && e.zone === 'HIVE');

        // Upward-facing CELL starts with 3 pre-staged NECTAR
        let activeCell = [
            { robotId: null, element: 'NECTAR' },
            { robotId: null, element: 'NECTAR' },
            { robotId: null, element: 'NECTAR' },
        ];

        for (const ev of hiveEvents) {
            activeCell.push({ robotId: ev.robotId, element: ev.element });

            if (activeCell.length >= HIVE_TIP_THRESHOLD) {
                const isAuto = ev.ts <= 30;
                const robotLaunches = activeCell.filter((item) => item.robotId !== null);

                if (robotLaunches.length > 0) {
                    const weightOf = (el) => (el === 'NECTAR' ? 1.25 : 1.0);
                    const totalWeight = robotLaunches.reduce((s, item) => s + weightOf(item.element), 0);

                    for (const item of robotLaunches) {
                        const share = weightOf(item.element) / totalWeight;
                        const pts = BIOBUZZ_POINTS.HIVE_TIP * share;
                        if (isAuto) credits[item.robotId].autoHive += pts;
                        else credits[item.robotId].teleopHive += pts;
                        credits[item.robotId].hiveTipsAttributed += share;
                    }
                }

                // Tipping empties the upward CELL onto the field
                activeCell = [];
            }
        }

        // Residual elements remaining in upward CELL at 2:30 (2 pts each)
        for (const item of activeCell) {
            if (item.robotId && credits[item.robotId]) {
                credits[item.robotId].teleopHive += BIOBUZZ_POINTS.HIVE_RESIDUAL;
            }
        }
    }

    // 2. FLOWER Stack Simulation (4 shared FLOWERS: F1..F4, each starting with 4 POLLEN)
    const flowerIds = ['F1', 'F2', 'F3', 'F4'];
    const flowers = {};
    flowerIds.forEach((id) => {
        flowers[id] = Array.from({ length: 4 }, () => ({
            robotId: null,
            alliance: 'NEUTRAL',
            element: 'POLLEN',
        }));
    });

    const flowerEvents = allEvents.filter((e) => e.zone === 'FLOWER');

    for (const ev of flowerEvents) {
        let targetFlower = flowerIds[0];
        for (const fId of flowerIds) {
            const currentHeight = flowers[fId].reduce(
                (h, item) => h + (ELEMENT_HEIGHT_IN[item.element] || 2.8),
                0
            );
            if (currentHeight + (ELEMENT_HEIGHT_IN[ev.element] || 2.8) <= MAX_FLOWER_STACK_IN + 0.01) {
                targetFlower = fId;
                break;
            }
        }

        flowers[targetFlower].push({
            robotId: ev.robotId,
            alliance: ev.alliance,
            element: ev.element,
        });
    }

    for (const fId of flowerIds) {
        const stack = flowers[fId];
        const legalVolume = [];
        let cumulativeHeight = 0;

        for (const item of stack) {
            const h = ELEMENT_HEIGHT_IN[item.element] || 2.8;
            if (cumulativeHeight + h <= MAX_FLOWER_STACK_IN + 0.01) {
                legalVolume.push(item);
                cumulativeHeight += h;
            } else {
                break;
            }
        }

        // 5-pt Bottom NECTAR Bonus per alliance color
        for (const alliance of ['RED', 'BLUE']) {
            const lowestNectar = legalVolume.find(
                (item) => item.element === 'NECTAR' && item.alliance === alliance
            );
            if (lowestNectar?.robotId && credits[lowestNectar.robotId]) {
                credits[lowestNectar.robotId].flower += BIOBUZZ_POINTS.FLOWER_BOTTOM_NECTAR;
            }
        }

        // Top-most legal NECTAR wins FLOWER ownership (2 pts per element inside)
        const nectars = legalVolume.filter((item) => item.element === 'NECTAR');
        const topNectar = nectars[nectars.length - 1];

        if (topNectar) {
            const ownerAlliance = topNectar.alliance;
            const capperRobot = topNectar.robotId;

            for (const item of legalVolume) {
                if (item.alliance === ownerAlliance && item.robotId && credits[item.robotId]) {
                    credits[item.robotId].flower += BIOBUZZ_POINTS.FLOWER_ELEMENT;
                } else if (capperRobot && credits[capperRobot]) {
                    credits[capperRobot].flower += BIOBUZZ_POINTS.FLOWER_ELEMENT;
                }
            }
        }
    }

    // 3. GARDEN Simulation (1 pt per element scored by robot)
    const gardenEvents = allEvents.filter((e) => e.zone === 'GARDEN');
    for (const ev of gardenEvents) {
        if (ev.robotId && credits[ev.robotId]) {
            credits[ev.robotId].garden += BIOBUZZ_POINTS.GARDEN_ELEMENT;
        }
    }

    for (const team of Object.keys(credits)) {
        const c = credits[team];
        c.total = c.autoMobility + c.teleopMobility + c.autoHive + c.teleopHive + c.flower + c.garden;
    }

    return credits;
}

/**
 * Finds the match scouting rows regardless of which tab name your backend uses.
 */
function extractMatchRows(data) {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.match)) return data.match;
    if (Array.isArray(data.matches)) return data.matches;
    if (Array.isArray(data.scouting)) return data.scouting;

    for (const val of Object.values(data)) {
        if (
            Array.isArray(val) &&
            val.length > 0 &&
            ('Match Number' in val[0] || 'Auto Hive Nectar' in val[0])
        ) {
            return val;
        }
    }
    return [];
}

/**
 * Generates an EWMA-weighted Pick List for a competition location.
 */
export function buildPickList(data, comp, { alpha = 0.35, sortBy = 'estimatedPoints' } = {}) {
    const pitList = (data?.pit || []).filter((entry) => String(entry['Location'] ?? '').trim() === comp);
    const matchRows = extractMatchRows(data).filter(
        (entry) => String(entry['Location'] ?? '').trim() === comp
    );

    const matchesByNumber = {};
    for (const row of matchRows) {
        const mNum = String(row['Match Number'] ?? '0').trim();
        if (!matchesByNumber[mNum]) matchesByNumber[mNum] = [];
        matchesByNumber[mNum].push(row);
    }

    const sortedMatchNums = Object.keys(matchesByNumber).sort((a, b) => Number(a) - Number(b));

    const teamHistories = {};
    for (const mNum of sortedMatchNums) {
        const matchCredits = simulateMatch(matchesByNumber[mNum]);
        for (const [team, credit] of Object.entries(matchCredits)) {
            if (!teamHistories[team]) teamHistories[team] = [];
            teamHistories[team].push({ matchNumber: mNum, ...credit });
        }
    }

    const allTeams = new Set([
        ...Object.keys(teamHistories),
        ...pitList.map((p) => String(p['Team Number'] ?? '').trim()).filter(Boolean),
    ]);

    const ewma = (values) => {
        if (!values.length) return 0;
        let acc = values[0];
        for (let i = 1; i < values.length; i++) {
            acc = alpha * values[i] + (1 - alpha) * acc;
        }
        return acc;
    };

    const avg = (values) =>
        values.length ? values.reduce((s, v) => s + v, 0) / values.length : 0;

    const results = Array.from(allTeams).map((team) => {
        const history = teamHistories[team] || [];
        const pit = pitList.find((p) => String(p['Team Number'] ?? '').trim() === team) || null;

        const totals = history.map((h) => h.total);
        const autos = history.map((h) => h.autoMobility + h.autoHive);
        const hives = history.map((h) => h.autoHive + h.teleopHive);
        const flowers = history.map((h) => h.flower);
        const gardens = history.map((h) => h.garden);
        const mobilities = history.map((h) => h.autoMobility + h.teleopMobility);
        const tips = history.map((h) => h.hiveTipsAttributed);

        return {
            team,
            matchesPlayed: history.length,
            estimatedPoints: Number(ewma(totals).toFixed(1)),
            avgPoints: Number(avg(totals).toFixed(1)),
            maxPoints: totals.length ? Number(Math.max(...totals).toFixed(1)) : 0,
            autoPoints: Number(ewma(autos).toFixed(1)),
            hivePoints: Number(ewma(hives).toFixed(1)),
            avgTips: Number(ewma(tips).toFixed(2)),
            flowerPoints: Number(ewma(flowers).toFixed(1)),
            gardenPoints: Number(ewma(gardens).toFixed(1)),
            mobilityPoints: Number(ewma(mobilities).toFixed(1)),
            pit,
            history,
        };
    });

    results.sort((a, b) => (b[sortBy] ?? 0) - (a[sortBy] ?? 0));
    return results;
}