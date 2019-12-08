import * as Ot from "@ot-builder/font";
import { OtGlyph } from "@ot-builder/ft-glyphs";
import { Data, Rectify } from "@ot-builder/prelude";

import { rectifyGlyphCmap } from "./encoding";
import { inPlaceRectifyGlyphCffTable } from "./glyph-store/cff";
import { RectifyGeomGlyphAlg } from "./glyph/glyph-alg";
import { rectifyBaseTableGlyphs } from "./layout/base";
import { rectifyGdefGlyphs } from "./layout/gdef";
import { rectifyLayoutGlyphs } from "./layout/gsub-gpos";

function rectifyFontGlyphStore<GS extends Data.OrderStore<OtGlyph>>(
    rec: Rectify.Glyph.RectifierT<OtGlyph>,
    font: Ot.Font<GS>,
    gsf: Data.OrderStoreFactory<OtGlyph, GS>
) {
    const gOrd = font.glyphs.decideOrder();
    const gList1: OtGlyph[] = [];
    for (const g of gOrd) {
        const g1 = rec.glyph(g);
        if (g1) gList1.push(g1);
    }

    const alg = new RectifyGeomGlyphAlg(rec);
    for (const g1 of gList1) {
        if (g1.geometry) {
            g1.geometry = g1.geometry.acceptGeometryAlgebra(alg);
        }
    }

    const glyphs1 = gsf.createStoreFromList(gList1);
    font.glyphs = glyphs1;
}

export function rectifyFontGlyphs<GS extends Data.OrderStore<OtGlyph>>(
    rec: Rectify.Glyph.RectifierT<OtGlyph>,
    font: Ot.Font<GS>,
    gsf: Data.OrderStoreFactory<OtGlyph, GS>
) {
    rectifyFontGlyphStore(rec, font, gsf);
    if (Ot.Font.isCff(font)) inPlaceRectifyGlyphCffTable(rec, font.cff);
    if (font.cmap) font.cmap = rectifyGlyphCmap(rec, font.cmap);
    if (font.gdef) {
        font.gdef = rectifyGdefGlyphs(font.gdef, rec);
    }
    if (font.gsub) {
        font.gsub = rectifyLayoutGlyphs(font.gsub, () => new Ot.Gsub.Table(), rec);
    }
    if (font.gpos) {
        font.gpos = rectifyLayoutGlyphs(font.gpos, () => new Ot.Gpos.Table(), rec);
    }
    if (font.base) {
        font.base = rectifyBaseTableGlyphs(rec, font.base);
    }
}
