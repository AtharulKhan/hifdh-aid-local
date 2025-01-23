import React from "react";
import { AmbientSoundStudio } from "@/components/mindfulness/AmbientSoundStudio";
import { MindfulMomentGenerator } from "@/components/mindfulness/MindfulMomentGenerator";
import { AIReflection } from "@/components/mindfulness/AIReflection";
import { Card } from "@/components/ui/card";
import { Leaf } from "lucide-react";

export default function Mindfulness() {
  return (
    <div className="container mx-auto p-6 min-h-screen bg-gradient-to-b from-secondary/5 to-primary/5">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-secondary flex items-center justify-center gap-2">
            <Leaf className="h-8 w-8 text-primary" />
            Mindful Space
          </h1>
          <p className="text-muted-foreground">
            Find peace and clarity through mindful practices and soothing sounds
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow">
            <AmbientSoundStudio />
          </Card>

          <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow">
            <MindfulMomentGenerator />
          </Card>

          <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow lg:col-span-2">
            <AIReflection />
          </Card>
        </div>
      </div>
    </div>
  );
}