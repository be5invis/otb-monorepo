import { ImpLib } from "@ot-builder/common-impl";
import { OtEncoding } from "@ot-builder/ft-encoding";
import { CffCoGlyphs, OtGlyph, TtfCoGlyphs } from "@ot-builder/ft-glyphs";
import { OtFontLayoutData } from "@ot-builder/ft-layout";
import { OtFontMetadata } from "@ot-builder/ft-metadata";
import { OtNameData } from "@ot-builder/ft-name";
import { Data } from "@ot-builder/prelude";

export type Font<GS extends Data.OrderStore<OtGlyph>> = Font.Cff<GS> | Font.Ttf<GS>;
export namespace Font {
    // TypeDefs
    type OtFontShared = OtFontMetadata & OtEncoding & OtFontLayoutData & OtNameData;
    export type Cff<GS extends Data.OrderStore<OtGlyph>> = OtFontShared &
        CffCoGlyphs & { glyphs: GS };
    export type Ttf<GS extends Data.OrderStore<OtGlyph>> = OtFontShared &
        TtfCoGlyphs & { glyphs: GS };

    export function isCff<GS extends Data.OrderStore<OtGlyph>>(font: Font<GS>): font is Cff<GS> {
        return !!(font as any).cff;
    }
    export function isTtf<GS extends Data.OrderStore<OtGlyph>>(font: Font<GS>): font is Ttf<GS> {
        return !isCff(font);
    }
}

export { OtVar as Var, GeneralVar } from "@ot-builder/variance";

export { Head, Maxp, Os2, MetricHead, Fvar, Post, Avar, Gasp } from "@ot-builder/ft-metadata";

export { OtGlyph as Glyph, GeneralGlyph } from "@ot-builder/ft-glyphs";
export { Cff, Cvt, Fpgm, Prep } from "@ot-builder/ft-glyphs";
export {
    OtGlyphNamingSource as GlyphNamingSource,
    OtGlyphNamer as GlyphNamer,
    OtGeometryHandler as GeometryHandler
} from "@ot-builder/ft-glyphs";
export { OtListGlyphStoreFactory as ListGlyphStoreFactory } from "@ot-builder/ft-glyphs";
export type ListGlyphStore = ImpLib.Order.ListStore<OtGlyph>;
export type GlyphStore = Data.OrderStore<OtGlyph>;
export type GlyphOrder = Data.Order<OtGlyph>;

export { Cmap, OtEncoding as Encoding } from "@ot-builder/ft-encoding";
export { Name, Stat, Meta } from "@ot-builder/ft-name";
export { DicingStore, Gdef, Gsub, Gpos, GsubGpos, Base } from "@ot-builder/ft-layout";
export { StandardOtGlyphNamer } from "@ot-builder/standard-glyph-namer";

export { Sfnt } from "@ot-builder/ft-sfnt";
