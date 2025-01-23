import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Brain, Heart, BookOpen, Activity, MessageSquare, HelpCircle } from "lucide-react";

interface FeatureCard {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: string;
  available: boolean;
}

const features: FeatureCard[] = [
  {
    id: 1,
    title: "AI Therapy Chat",
    description: "Talk to our AI therapist about your thoughts and feelings",
    icon: <Brain className="w-8 h-8" />,
    action: "Start Chat",
    available: true
  },
  {
    id: 2,
    title: "Mood Journal",
    description: "Track your daily moods and emotions",
    icon: <BookOpen className="w-8 h-8" />,
    action: "Write Entry",
    available: true
  },
  {
    id: 3,
    title: "Mindfulness Exercises",
    description: "Guided meditation and breathing exercises",
    icon: <Heart className="w-8 h-8" />,
    action: "Begin",
    available: true
  },
  {
    id: 4,
    title: "Progress Tracking",
    description: "Monitor your mental health journey",
    icon: <Activity className="w-8 h-8" />,
    action: "View Stats",
    available: true
  },
  {
    id: 5,
    title: "Community Support",
    description: "Connect with others on similar journeys",
    icon: <MessageSquare className="w-8 h-8" />,
    action: "Join Now",
    available: true
  },
  {
    id: 6,
    title: "Professional Help",
    description: "Find licensed therapists and resources",
    icon: <HelpCircle className="w-8 h-8" />,
    action: "Get Help",
    available: true
  }
];

const Menu = () => {
  const { toast } = useToast();

  const handleFeatureClick = (feature: FeatureCard) => {
    toast({
      title: "Coming Soon",
      description: `${feature.title} will be available in the next update.`
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Mental Health Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => (
          <Card 
            key={feature.id} 
            className="overflow-hidden hover:shadow-lg transition-all duration-300 animate-fadeIn hover:scale-105"
          >
            <div className="p-6">
              <div className="text-primary mb-4 flex justify-center">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2 text-center">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-center">{feature.description}</p>
              <div className="flex justify-center">
                <Button 
                  onClick={() => handleFeatureClick(feature)}
                  className="bg-accent hover:bg-accent/90 animate-glow"
                >
                  {feature.action}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Menu;