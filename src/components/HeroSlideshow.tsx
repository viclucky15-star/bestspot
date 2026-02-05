 import { useState, useEffect, useCallback } from 'react';
 import { cn } from '@/lib/utils';
 
 interface SlideImage {
   url: string;
   state: string;
 }
 
 const SUPABASE_URL = 'https://yeozxngrdhitohhxxsht.supabase.co/storage/v1/object/public';
 
 const slides: SlideImage[] = [
   { url: `${SUPABASE_URL}/abia/Azumini%20Blue%20River.jpg`, state: 'Abia' },
   { url: `${SUPABASE_URL}/anambra/Ogba%20Ukwu%20Waterfall.jpg`, state: 'Anambra' },
   { url: `${SUPABASE_URL}/places/Awhum%20Waterfall.jpg`, state: 'Enugu' },
   { url: `${SUPABASE_URL}/ebonyi/Ndibe%20Beach.jpeg`, state: 'Ebonyi' },
   { url: `${SUPABASE_URL}/publicimo/Oguta%20Lake.jpg`, state: 'Imo' },
 ];
 
 const AUTO_SLIDE_INTERVAL = 5000; // 5 seconds
 
 export const HeroSlideshow = () => {
   const [currentIndex, setCurrentIndex] = useState(0);
   const [isLoaded, setIsLoaded] = useState<boolean[]>(new Array(slides.length).fill(false));
 
   const goToSlide = useCallback((index: number) => {
     setCurrentIndex(index);
   }, []);
 
   const nextSlide = useCallback(() => {
     setCurrentIndex((prev) => (prev + 1) % slides.length);
   }, []);
 
   // Auto-advance slides
   useEffect(() => {
     const interval = setInterval(nextSlide, AUTO_SLIDE_INTERVAL);
     return () => clearInterval(interval);
   }, [nextSlide]);
 
   // Preload images
   useEffect(() => {
     slides.forEach((slide, index) => {
       const img = new Image();
       img.onload = () => {
         setIsLoaded((prev) => {
           const newLoaded = [...prev];
           newLoaded[index] = true;
           return newLoaded;
         });
       };
       img.src = slide.url;
     });
   }, []);
 
   return (
     <div className="absolute inset-0 overflow-hidden rounded-2xl">
       {/* Slides */}
       {slides.map((slide, index) => (
         <div
           key={slide.state}
           className={cn(
             'absolute inset-0 transition-opacity duration-1000 ease-in-out',
             index === currentIndex ? 'opacity-100' : 'opacity-0'
           )}
         >
           <div
             className="w-full h-full bg-cover bg-center"
             style={{
               backgroundImage: isLoaded[index] ? `url(${slide.url})` : undefined,
               backgroundColor: isLoaded[index] ? undefined : 'hsl(var(--muted))',
             }}
           />
         </div>
       ))}
 
       {/* Gradient overlay */}
       <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
 
       {/* Dot indicators */}
       <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
         {slides.map((slide, index) => (
           <button
             key={slide.state}
             onClick={() => goToSlide(index)}
             aria-label={`Go to slide ${index + 1}`}
             className={cn(
               'w-2 h-2 rounded-full transition-all duration-300',
               index === currentIndex
                 ? 'bg-primary-foreground w-6'
                 : 'bg-primary-foreground/50 hover:bg-primary-foreground/70'
             )}
           />
         ))}
       </div>
     </div>
   );
 };