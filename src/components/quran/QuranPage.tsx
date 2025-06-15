
import React from "react";
import lines from "../../data/lines.json";
import { cn } from "@/lib/utils";

type Props = {
  pageNumber: number;
};

const QuranPage: React.FC<Props> = ({ pageNumber }) => {
  const page = (lines as Record<string, any[]>)[pageNumber];

  if (!page) return <div className="text-center p-8">Page not found.</div>;

  return (
    <div className="flex flex-col gap-1 text-2xl leading-[2.3rem] p-4 bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="text-sm text-gray-500 self-end mb-1">
        صفحة&nbsp;{pageNumber}
      </div>

      {page.map((ln, idx) => (
        <React.Fragment key={idx}>
          <div
            className={cn(
              "whitespace-pre-wrap text-right font-serif py-2",
              ln.centered && "text-center"
            )}
          >
            {ln.text}
          </div>
          {idx < page.length - 1 && (
            <hr className="border-gray-200" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default QuranPage;
