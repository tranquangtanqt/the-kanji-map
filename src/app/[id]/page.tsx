import {
  getAllKanji,
  getGraphData,
  getKanjiDataLocal,
  getNavigableRadicalIds,
  getStrokeAnimation,
} from "@/lib";
import { aliasIds, getKanjiVariants, resolveKanjiId } from "@/lib/kanji-variants";
import { Metadata } from "next";
import { KanjiPageContent } from "./inner";
import { Header } from "@/components/header";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export const dynamic = "force-static";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id: urlEncodedId } = await params;
  const id = resolveKanjiId(decodeURIComponent(urlEncodedId));
  return {
    title: id,
    alternates: {
      canonical: `/${encodeURIComponent(id)}`,
    },
  };
}

export async function generateStaticParams() {
  const canonicalIds = getAllKanji().map(({ params: { id } }) => id);

  return [...canonicalIds, ...aliasIds].map((id) => ({
    id,
  }));
}

export default async function KanjiPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: urlEncodedId } = await params;
  const requestedId = decodeURIComponent(urlEncodedId);
  const canonicalId = resolveKanjiId(requestedId);
  const [kanjiInfo, graphData, strokeAnimation] = await Promise.all([
    getKanjiDataLocal(canonicalId),
    getGraphData(canonicalId),
    getStrokeAnimation(canonicalId),
  ]);
  const navigableRadicalIds = getNavigableRadicalIds();

  if (!kanjiInfo) {
    notFound();
  }

  return (
    <div className="size-full flex flex-col">
      <Header className="w-full" />
      <Suspense fallback={<div className="w-full grow overflow-hidden" />}>
        <KanjiPageContent
          requestedId={requestedId}
          canonicalId={canonicalId}
          variantInfo={getKanjiVariants(canonicalId)}
          kanjiInfo={kanjiInfo}
          graphData={graphData}
          strokeAnimation={strokeAnimation}
          navigableRadicalIds={navigableRadicalIds}
        />
      </Suspense>
    </div>
  );
}
