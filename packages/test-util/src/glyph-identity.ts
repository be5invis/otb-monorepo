import { OtGlyph } from "@ot-builder/ft-glyphs";
import { Data } from "@ot-builder/prelude";
import { OtVar } from "@ot-builder/variance";

import { FastMatch } from "./fast-match";

export namespace GlyphIdentity {
    export enum CompareMode {
        RemoveCycle = 1,
        CompareMetric = 2,
        CompareInstructions = 4,
        CompareName = 8,

        TTF = 6
    }

    export function test(
        expected: OtGlyph,
        actual: OtGlyph,
        mode: CompareMode = 0,
        tolerance = 1,
        place = ""
    ) {
        if (mode & CompareMode.CompareName) {
            expect(actual.name).toBe(expected.name);
        }
        if (mode & CompareMode.CompareMetric) {
            FastMatch.otvar(actual.horizontal.start, expected.horizontal.start, "HM start");
            FastMatch.otvar(actual.horizontal.end, expected.horizontal.end, "HM end");
            FastMatch.otvar(actual.vertical.start, expected.vertical.start, "VM start");
            FastMatch.otvar(actual.vertical.end, expected.vertical.end, "VM end");
        }
        testGeometry(expected.geometry, actual.geometry, mode, tolerance, place);
        if (mode & CompareMode.CompareInstructions) {
            if (expected.hints && expected.hints.queryInterface(OtGlyph.TID_TtInstructionHint)) {
                expect(actual.hints).toBeTruthy();
                expect(actual.hints!.queryInterface(OtGlyph.TID_TtInstructionHint)).toBeTruthy();
                expect((expected.hints! as OtGlyph.TtInstructionHint).instructions).toEqual(
                    (actual.hints! as OtGlyph.TtInstructionHint).instructions
                );
            }
        }
    }

    function testGeometry(
        geomE: Data.Maybe<OtGlyph.Geometry>,
        geomA: Data.Maybe<OtGlyph.Geometry>,
        mode: CompareMode = 0,
        tolerance = 1,
        place = ""
    ) {
        if (!geomE && !geomA) return;
        expect(!!geomE).toBe(!!geomA);

        if (geomE!.queryInterface(OtGlyph.TID_ContourSet)) {
            expect(geomA!.queryInterface(OtGlyph.TID_ContourSet)).toBeTruthy();
            testContours(
                geomE as OtGlyph.ContourSet,
                geomA as OtGlyph.ContourSet,
                !!(mode & CompareMode.RemoveCycle),
                tolerance,
                place
            );
        } else if (geomE!.queryInterface(OtGlyph.TID_GeometryList)) {
            expect(geomA!.queryInterface(OtGlyph.TID_GeometryList)).toBeTruthy();
            testGeometryList(
                geomE as OtGlyph.GeometryList,
                geomA as OtGlyph.GeometryList,
                mode,
                tolerance
            );
        } else if (geomE!.queryInterface(OtGlyph.TID_TtReference)) {
            expect(geomA!.queryInterface(OtGlyph.TID_TtReference)).toBeTruthy();
            testReference(
                geomE as OtGlyph.TtReference,
                geomA as OtGlyph.TtReference,
                mode,
                tolerance
            );
        } else {
            throw new TypeError("Unknown geometry type");
        }
    }

    export function testStore<GS extends Data.OrderStore<OtGlyph>>(
        expected: GS,
        actual: GS,
        mode: CompareMode = 0,
        tolerance = 1
    ) {
        const goA = expected.decideOrder();
        const goB = actual.decideOrder();
        expect(goA.length).toBe(goB.length);
        for (let gid = 0; gid < goA.length; gid++) {
            test(goA.at(gid), goB.at(gid), mode, tolerance, "#" + gid);
        }
    }

    function removeContourCycle(c: OtGlyph.Point[]) {
        if (!c || !c.length) return;
        if (
            OtVar.Ops.equal(c[0].x, c[c.length - 1].x, 1 / 64) &&
            OtVar.Ops.equal(c[0].y, c[c.length - 1].y, 1 / 64) &&
            c[0].kind === OtGlyph.PointType.Corner &&
            c[c.length - 1].kind === OtGlyph.PointType.Corner
        ) {
            c.pop();
        }
    }

    function testContours(
        expected: OtGlyph.ContourSet,
        actual: OtGlyph.ContourSet,
        handleCycle: boolean,
        tolerance: number,
        place = ""
    ) {
        FastMatch.exactly(actual.contours.length, expected.contours.length);

        for (let contourId = 0; contourId < expected.contours.length; contourId++) {
            const cE = [...expected.contours[contourId]];
            const cA = [...actual.contours[contourId]];
            if (handleCycle) {
                removeContourCycle(cE);
                removeContourCycle(cA);
            }
            if (cE.length !== cA.length) console.log(cE, cA);
            FastMatch.exactly(cE.length, cA.length);

            for (let zid = 0; zid < cE.length; zid++) {
                FastMatch.otvar(
                    cE[zid].x,
                    cA[zid].x,
                    place + "/" + contourId + "/" + zid + "/x",
                    tolerance
                );
                FastMatch.otvar(
                    cE[zid].y,
                    cA[zid].y,
                    place + "/" + contourId + "/" + zid + "/y",
                    tolerance
                );
                FastMatch.exactly(cE[zid].kind, cA[zid].kind);
            }
        }
    }

    function testGeometryList(
        expected: OtGlyph.GeometryList,
        actual: OtGlyph.GeometryList,
        tolerance: number,
        mode: number
    ) {
        expect(expected.items.length).toBe(actual.items.length);
        for (let rid = 0; rid < expected.items.length; rid++) {
            const expectedItem = expected.items[rid];
            const actualItem = actual.items[rid];
            testGeometry(expectedItem, actualItem, mode, tolerance);
        }
    }

    function testReference(
        expected: OtGlyph.TtReference,
        actual: OtGlyph.TtReference,
        tolerance: number,
        mode: number
    ) {
        test(expected.to, actual.to, mode, tolerance);
        FastMatch.otvar(expected.transform.dx, actual.transform.dx, "dx", tolerance);
        FastMatch.otvar(expected.transform.dy, actual.transform.dy, "dy", tolerance);
        FastMatch.otvar(expected.transform.xx, actual.transform.xx, "xx", tolerance);
        FastMatch.otvar(expected.transform.xy, actual.transform.xy, "xy", tolerance);
        FastMatch.otvar(expected.transform.yx, actual.transform.yx, "yx", tolerance);
        FastMatch.otvar(expected.transform.yy, actual.transform.yy, "yy", tolerance);
        FastMatch.exactly(expected.transform.scaledOffset, actual.transform.scaledOffset);
        FastMatch.exactly(expected.useMyMetrics, actual.useMyMetrics);
        FastMatch.exactly(expected.roundXyToGrid, actual.roundXyToGrid);
    }
}
