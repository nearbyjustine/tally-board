"use client";

import { useState, useEffect, useRef } from "react";
import type { TeamWithScore, TeamImage } from "@/lib/types";
import { Trophy, Target, Award, AlertTriangle } from "lucide-react";

const RANK_LABEL: Record<number, string> = {
  1: "1st",
  2: "2nd",
  3: "3rd",
  4: "4th",
};

interface TeamColumnProps {
  team: TeamWithScore;
  images: TeamImage[];
  index: number;
  total: number;
}

export function TeamColumn({ team, images, index, total }: TeamColumnProps) {
  const [currentImg, setCurrentImg] = useState(0);
  const [prevImg, setPrevImg] = useState(0);
  const [fading, setFading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cycle images every 5 seconds
  useEffect(() => {
    if (images.length <= 1) return;

    intervalRef.current = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setPrevImg(currentImg);
        setCurrentImg((prev) => (prev + 1) % images.length);
        // Small delay then unfade
        setTimeout(() => setFading(false), 50);
      }, 800);
    }, 5000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [images.length, currentImg]);

  const hasImages = images.length > 0;
  const rankLabel = RANK_LABEL[team.rank] ?? `${team.rank}th`;

  return (
    <div
      className="relative flex-1 min-w-[100vw] md:min-w-0 h-full snap-start overflow-hidden"
      style={{
        animationDelay: `${index * 120}ms`,
        animationFillMode: "backwards",
      }}
    >
      {/* Background layer */}
      {hasImages ? (
        <>
          {/* Previous image (behind) */}
          <img
            src={images[prevImg]?.url}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Current image (fades in) */}
          <img
            src={images[currentImg]?.url}
            alt=""
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
              fading ? "opacity-0" : "opacity-100"
            }`}
          />
        </>
      ) : (
        /* Fallback: team color */
        <div
          className="absolute inset-0"
          style={{ backgroundColor: team.color }}
        />
      )}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/45" />

      {/* Bottom gradient for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Top subtle gradient for header readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent h-32" />

      {/* Content — pinned to bottom */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
        {/* Rank badge */}
        <div
          className="font-heading text-sm font-bold tracking-wide uppercase mb-2 animate-in fade-in slide-in-from-bottom-2 duration-500"
          style={{
            color: team.color,
            animationDelay: `${index * 120 + 200}ms`,
            animationFillMode: "backwards",
          }}
        >
          {rankLabel} Place
        </div>

        {/* Team name */}
        <h2
          className="font-heading text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight mb-3 animate-in fade-in slide-in-from-bottom-3 duration-500"
          style={{
            animationDelay: `${index * 120 + 300}ms`,
            animationFillMode: "backwards",
          }}
        >
          {team.name}
        </h2>

        {/* Score */}
        <div
          className="animate-in fade-in slide-in-from-bottom-4 duration-500"
          style={{
            animationDelay: `${index * 120 + 400}ms`,
            animationFillMode: "backwards",
          }}
        >
          <div className="flex items-baseline gap-2 mb-4">
            <span
              className="font-heading text-6xl md:text-7xl font-extrabold tabular-nums leading-none"
              style={{ color: team.color }}
            >
              {team.total}
            </span>
            <span className="text-white/50 text-sm font-medium uppercase tracking-widest">
              pts
            </span>
          </div>

          {/* Breakdown pills */}
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-white/70 bg-white/10 backdrop-blur-sm px-2.5 py-1 rounded-full">
              <Trophy className="h-3 w-3" />
              +{team.gamePoints}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-white/70 bg-white/10 backdrop-blur-sm px-2.5 py-1 rounded-full">
              <Target className="h-3 w-3" />
              +{team.missionPoints}
            </span>
            {team.awardPoints > 0 && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-300/80 bg-emerald-500/15 backdrop-blur-sm px-2.5 py-1 rounded-full">
                <Award className="h-3 w-3" />
                +{team.awardPoints}
              </span>
            )}
            {team.deductionPoints > 0 && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-red-300/80 bg-red-500/15 backdrop-blur-sm px-2.5 py-1 rounded-full">
                <AlertTriangle className="h-3 w-3" />
                -{team.deductionPoints}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Image indicator dots */}
      {images.length > 1 && (
        <div className="absolute bottom-6 right-6 md:bottom-8 md:right-8 flex gap-1.5">
          {images.map((_, i) => (
            <div
              key={images[i].id}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === currentImg
                  ? "w-4 bg-white/80"
                  : "w-1.5 bg-white/30"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
