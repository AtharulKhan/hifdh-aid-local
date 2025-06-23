
import React, { useState, useMemo } from 'react';
import { Search, Heart, Calendar, User, ExternalLink, BookOpen, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDebounce } from '@/hooks/use-debounce';

interface HifdhStory {
  id: string;
  title: string;
  author: string;
  summary: string;
  content: {
    introduction: string;
    keyMoments: Array<{
      title: string;
      content: string;
      lesson: string;
    }>;
    advice: string[];
    conclusion: string;
  };
  source: {
    url: string;
    website: string;
  };
  tags: string[];
  readTime: string;
  publishedDate: string;
  highlights: string[];
}

const stories: HifdhStory[] = [
  {
    id: '1',
    title: 'An Amazing Hifdh Story Everyone Needs To Hear',
    author: 'Qāri\' Mubashir',
    summary: 'A remarkable journey of healing through Qur\'an memorization - overcoming multiple health challenges including heart disease, depression, and other ailments through the power of Hifdh.',
    content: {
      introduction: 'This extraordinary story demonstrates how the Qur\'an became both medicine and motivation for a young woman facing multiple health challenges. At just 17-18 years old, she battled heart disease, liver complications, kidney issues, and severe depression while pursuing her Hifdh journey.',
      keyMoments: [
        {
          title: 'The Struggle Begins',
          content: 'Despite memorizing significant portions including Juz\' 30, 29, and several complete surahs like al-Baqarah, Ale-\'Imran, and an-Nisa\', she found no comfort and retreated from memorization as her illnesses worsened.',
          lesson: 'Sometimes we need to step back before we can move forward. Struggles are part of the journey.'
        },
        {
          title: 'The Divine Dream',
          content: 'Years later, when she heard about the Abu Faisal Hifdh course, she had a powerful dream where papers with Qur\'anic verses fell from the sky, with the last one containing verse 39:53: "Do not lose mercy in the Rahmah of Allah." A voice told her, "Do not lose hope in the Rahmah of Allah for we are with you."',
          lesson: 'Allah communicates with sincere hearts in ways that ignite hope and determination.'
        },
        {
          title: 'Miraculous Healings',
          content: 'As she progressed through memorization, her diseases were cured one by one: kidney disease after completing Surah al-Baqarah, uterine disease upon reaching Surah Yusuf, liver disease during the last three juz\', and finally heart disease on the day she completed her entire Hifdh.',
          lesson: 'The Qur\'an is a source of healing - both spiritual and physical - for those who approach it with sincerity.'
        }
      ],
      advice: [
        'Use a "memorization fund" - put money in a box with the intention of ease in your task whenever you want to memorize',
        'Perfume your Mushaf with a scent you love and keep it with you everywhere',
        'Listen to Islamic nasheeds like "Ya Hamil al-Qur\'an" for motivation',
        'Make lots of Istighfar (seeking forgiveness)',
        'Continue reviewing even after completion - the work never ends',
        'Long and yearn for the Qur\'an - develop a love relationship with it',
        'Remember your "why" - you\'ll get what you intend'
      ],
      conclusion: 'This story proves that the Qur\'an is like paradise, life, and bliss. It can untie the burdens of life with its fragrant verses. No matter what challenges you face, approach the Qur\'an with love, consistency, and trust in Allah\'s plan.'
    },
    source: {
      url: 'https://howtomemorisethequran.com/a-hifdh-story-everyone-needs-to-hear/',
      website: 'How To Memorise The Quran'
    },
    tags: ['healing', 'health challenges', 'depression', 'miracles', 'Abu Faisal', 'dreams', 'motivation', 'review', 'completion'],
    readTime: '6 mins',
    publishedDate: 'July 18, 2022',
    highlights: [
      'Cured of 4 different diseases through Qur\'an memorization',
      'Received divine guidance through dreams',
      'Developed unique memorization techniques including the "memorization fund"',
      'Completed full Hifdh despite severe health challenges'
    ]
  }
];

export default function HifdhStories() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStory, setSelectedStory] = useState<HifdhStory | null>(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const filteredStories = useMemo(() => {
    if (!debouncedSearchTerm) return stories;
    
    const term = debouncedSearchTerm.toLowerCase();
    return stories.filter(story => 
      story.title.toLowerCase().includes(term) ||
      story.author.toLowerCase().includes(term) ||
      story.summary.toLowerCase().includes(term) ||
      story.tags.some(tag => tag.toLowerCase().includes(term)) ||
      story.highlights.some(highlight => highlight.toLowerCase().includes(term))
    );
  }, [debouncedSearchTerm]);

  if (selectedStory) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button 
          variant="ghost" 
          onClick={() => setSelectedStory(null)}
          className="mb-6"
        >
          ← Back to Stories
        </Button>
        
        <Card className="mb-8">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl md:text-3xl mb-2 text-green-700">
                  {selectedStory.title}
                </CardTitle>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {selectedStory.author}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {selectedStory.publishedDate}
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    {selectedStory.readTime}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedStory.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="bg-green-100 text-green-700">
                  {tag}
                </Badge>
              ))}
            </div>
            
            <a 
              href={selectedStory.source.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
            >
              <ExternalLink className="h-4 w-4" />
              Read original on {selectedStory.source.website}
            </a>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="story" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="story">Story</TabsTrigger>
                <TabsTrigger value="highlights">Key Highlights</TabsTrigger>
                <TabsTrigger value="advice">Practical Advice</TabsTrigger>
              </TabsList>
              
              <TabsContent value="story" className="space-y-6 mt-6">
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3 text-green-800">Introduction</h3>
                  <p className="text-gray-700 leading-relaxed">{selectedStory.content.introduction}</p>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-gray-800">Key Moments</h3>
                  {selectedStory.content.keyMoments.map((moment, index) => (
                    <Card key={index} className="border-l-4 border-l-green-500">
                      <CardContent className="pt-4">
                        <h4 className="font-medium text-green-700 mb-2">{moment.title}</h4>
                        <p className="text-gray-700 mb-3 leading-relaxed">{moment.content}</p>
                        <div className="bg-amber-50 p-3 rounded border-l-4 border-l-amber-400">
                          <p className="text-amber-800 text-sm font-medium">💡 Lesson: {moment.lesson}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3 text-blue-800">Conclusion</h3>
                  <p className="text-gray-700 leading-relaxed">{selectedStory.content.conclusion}</p>
                </div>
              </TabsContent>
              
              <TabsContent value="highlights" className="mt-6">
                <div className="grid gap-4">
                  {selectedStory.highlights.map((highlight, index) => (
                    <Card key={index} className="border-l-4 border-l-purple-500">
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-3">
                          <Sparkles className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                          <p className="text-gray-700">{highlight}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="advice" className="mt-6">
                <div className="grid gap-3">
                  {selectedStory.content.advice.map((advice, index) => (
                    <Card key={index} className="border-l-4 border-l-emerald-500">
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-3">
                          <div className="bg-emerald-100 text-emerald-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0">
                            {index + 1}
                          </div>
                          <p className="text-gray-700">{advice}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Hifdh Stories
        </h1>
        <p className="text-gray-600 text-lg">
          Inspiring journeys of Qur'an memorization that will motivate and guide your own Hifdh path
        </p>
      </div>

      <div className="mb-8">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search stories, authors, or keywords..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredStories.map((story) => (
          <Card key={story.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedStory(story)}>
            <CardHeader>
              <CardTitle className="text-lg text-green-700 mb-2 line-clamp-2">
                {story.title}
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                <User className="h-4 w-4" />
                {story.author}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4 line-clamp-3 leading-relaxed">
                {story.summary}
              </p>
              
              <div className="flex flex-wrap gap-1 mb-4">
                {story.tags.slice(0, 3).map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs bg-green-100 text-green-700">
                    {tag}
                  </Badge>
                ))}
                {story.tags.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{story.tags.length - 3} more
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  {story.readTime}
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="h-4 w-4 text-red-500" />
                  Inspiring
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredStories.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No stories found</h3>
          <p className="text-gray-600">Try adjusting your search terms or browse all stories</p>
        </div>
      )}
    </div>
  );
}
