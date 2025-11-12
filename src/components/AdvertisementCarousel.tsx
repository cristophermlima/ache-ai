import { useEffect, useState } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Autoplay from "embla-carousel-autoplay";
import { supabase } from "@/integrations/supabase/client";

interface Advertisement {
  id: string;
  title: string;
  subtitle: string;
  cta_text: string;
  gradient: string;
  image_url: string | null;
}

export const AdvertisementCarousel = () => {
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdvertisements();
  }, []);

  const fetchAdvertisements = async () => {
    try {
      const { data, error } = await supabase
        .from("advertisements")
        .select("*")
        .eq("is_active", true)
        .order("display_order");

      if (error) {
        console.error("Error fetching advertisements:", error);
        return;
      }

      setAdvertisements(data || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || advertisements.length === 0) {
    return null;
  }
  return (
    <section className="container mx-auto px-4 py-8">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        plugins={[
          Autoplay({
            delay: 4000,
          }),
        ]}
        className="w-full"
      >
        <CarouselContent>
          {advertisements.map((ad) => (
            <CarouselItem key={ad.id}>
              <Card className="border-0 overflow-hidden">
                <div className={`bg-gradient-to-r ${ad.gradient} text-white p-8 md:p-16 rounded-lg min-h-[300px] flex flex-col justify-center items-center text-center`}>
                  <div className="max-w-2xl space-y-4">
                    <h2 className="text-3xl md:text-5xl font-bold drop-shadow-lg">
                      {ad.title}
                    </h2>
                    <p className="text-lg md:text-xl opacity-90 drop-shadow">
                      {ad.subtitle}
                    </p>
                    <Button 
                      size="lg" 
                      variant="secondary"
                      className="mt-4 bg-white text-gray-900 hover:bg-gray-100"
                    >
                      {ad.cta_text}
                    </Button>
                  </div>
                </div>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4" />
        <CarouselNext className="right-4" />
      </Carousel>
    </section>
  );
};
