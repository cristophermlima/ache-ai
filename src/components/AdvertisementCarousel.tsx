import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Autoplay from "embla-carousel-autoplay";

const advertisements = [
  {
    id: 1,
    title: "Encontre produtos locais",
    subtitle: "Compre de lojas próximas a você",
    gradient: "from-primary via-primary/90 to-primary/80",
    cta: "Explorar Agora"
  },
  {
    id: 2,
    title: "Parcele em até 12x",
    subtitle: "Sem juros no cartão",
    gradient: "from-accent via-accent/90 to-accent/80",
    cta: "Ver Ofertas"
  },
  {
    id: 3,
    title: "Pagamento Rápido e Seguro",
    subtitle: "Realize pagamentos de forma segura",
    gradient: "from-secondary via-secondary/90 to-secondary/80",
    cta: "Saiba Mais"
  }
];

export const AdvertisementCarousel = () => {
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
                <div className={`bg-gradient-to-r ${ad.gradient} text-primary-foreground p-8 md:p-16 rounded-lg min-h-[300px] flex flex-col justify-center items-center text-center`}>
                  <div className="max-w-2xl space-y-4">
                    <h2 className="text-3xl md:text-5xl font-bold">
                      {ad.title}
                    </h2>
                    <p className="text-lg md:text-xl opacity-90">
                      {ad.subtitle}
                    </p>
                    <Button 
                      size="lg" 
                      variant="secondary"
                      className="mt-4"
                    >
                      {ad.cta}
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
