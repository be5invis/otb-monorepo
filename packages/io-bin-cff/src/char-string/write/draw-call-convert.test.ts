import { OtVar } from "@ot-builder/variance";

import { CffWriteContext } from "../../context/write";
import { CharStringOperator } from "../../interp/operator";

import { CffDrawCall, CffDrawCallRaw } from "./draw-call";
import { Mir } from "./mir";
import { mirSeqIsWellFormed } from "./test-util";

const Wght: OtVar.Axis = {
    tag: "wght",
    min: 100,
    default: 400,
    max: 900
};
const Wdth: OtVar.Axis = {
    tag: "wdth",
    min: 25,
    default: 100,
    max: 200
};
const Bold = new OtVar.Master([
    { axis: Wght, min: 0, peak: 1, max: 1 },
    { axis: Wdth, min: -1, peak: 0, max: 1 }
]);
const Wide = new OtVar.Master([
    { axis: Wght, min: -1, peak: 0, max: 1 },
    { axis: Wdth, min: 0, peak: 1, max: 1 }
]);
const Corner = new OtVar.Master([
    { axis: Wght, min: 0, peak: 1, max: 1 },
    { axis: Wdth, min: 0, peak: 1, max: 1 }
]);

test("CFF Encoding: Draw call conversion", () => {
    const cr = OtVar.Ops.Creator();
    const ctx = new CffWriteContext(2, 1000);
    const dcrSeq = new CffDrawCallRaw(
        [
            cr.make(1, [Bold, 2], [Wide, 3]),
            cr.make(4, [Bold, 5], [Wide, 6]),
            7,
            cr.make(8, [Bold, 9], [Wide, 10])
        ],
        CharStringOperator.RLineTo
    );
    const dcSeq = CffDrawCall.charStringSeqFromRawSeq(ctx, [dcrSeq]);
    const mirSeq = CffDrawCall.charStringSeqToMir(ctx, dcSeq);

    mirSeqIsWellFormed(ctx, mirSeq);
    expect(mirSeq).toEqual([
        Mir.operand(0),
        Mir.operator(CharStringOperator.VsIndex, -1),
        Mir.operand(1),
        Mir.operand(4),
        Mir.operand(2),
        Mir.operand(3),
        Mir.operand(5),
        Mir.operand(6),
        Mir.operand(2),
        Mir.operator(CharStringOperator.Blend, -5),
        Mir.operand(7),
        Mir.operand(8),
        Mir.operand(9),
        Mir.operand(10),
        Mir.operand(1),
        Mir.operator(CharStringOperator.Blend, -3),
        Mir.operator(CharStringOperator.RLineTo, -4)
    ]);
});

test("CFF Encoding: Draw call conversion should not overflow", () => {
    const cr = OtVar.Ops.Creator(new OtVar.MasterSet());
    const ctx = new CffWriteContext(2, 1000);
    let a: OtVar.Value[] = [];
    for (let x = 0; x < 128; x++) {
        if (x % 2) a.push(cr.make(x, [Bold, x]));
        else a.push(cr.make(x, [Wide, x]));
    }
    const dcrSeq = new CffDrawCallRaw(a, CharStringOperator.RLineTo);
    const dcSeq = CffDrawCall.charStringSeqFromRawSeq(ctx, [dcrSeq]);
    const mirSeq = CffDrawCall.charStringSeqToMir(ctx, dcSeq);

    mirSeqIsWellFormed(ctx, mirSeq);
});
