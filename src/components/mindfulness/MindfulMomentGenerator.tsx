import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, RefreshCw } from "lucide-react";

const exercises = [
  {
    type: "grounding",
    content: "Take 3 deep breaths, focusing on the sensation of air moving through your body.",
  },
  {
    type: "gratitude",
    content: "Name three things you can see right now that you're grateful for.",
  },
  {
    type: "sensory",
    content: "Notice 5 things you can see, 4 things you can touch, 3 things you can hear, 2 things you can smell, and 1 thing you can taste.",
  },
  {
    type: "grounding",
    content: "Feel the weight of your body against the chair or floor. Notice the points of contact and pressure.",
  },
  {
    type: "gratitude",
    content: "Think of someone who helped you recently. What did they do that you appreciate?",
  },
];

export function MindfulMomentGenerator() {
  const [currentExercise, setCurrentExercise] = useState(exercises[0]);

  const generateNewExercise = () => {
    const newExercise = exercises[Math.floor(Math.random() * exercises.length)];
    setCurrentExercise(newExercise);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-secondary">Mindful Moment</h2>
        <Button
          variant="outline"
          size="icon"
          onClick={generateNewExercise}
          className="h-10 w-10 rounded-full"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <Card className="p-6 bg-primary/5 border-none">
        <p className="text-lg leading-relaxed text-center">
          {currentExercise.content}
        </p>
      </Card>

      <div className="flex justify-center">
        <Button
          variant="outline"
          className="gap-2"
          onClick={generateNewExercise}
        >
          <Heart className="h-4 w-4 text-primary" />
          New Moment
        </Button>
      </div>
    </div>
  );
}