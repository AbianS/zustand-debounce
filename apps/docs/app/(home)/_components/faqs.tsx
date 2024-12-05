import { Container } from '@/components/container';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'faq.q1',
    answer: 'faq.a1',
  },
  {
    question: 'faq.q11',
    answer: 'faq.a11',
  },
  {
    question: 'faq.q12',
    answer: 'faq.a12',
  },
  {
    question: 'faq.q13',
    answer: 'faq.a13',
  },
];

export function Faqs() {
  return (
    <section
      id="faqs"
      aria-labelledby="faq-title"
      className="relative overflow-hidden"
    >
      <Container className="relative flex flex-col gap-10">
        <div className="mx-auto lg:mx-0 justify-center w-full">
          <h2
            id="faq-title"
            className="font-display text-3xl tracking-tight text-primary sm:text-4xl text-center"
          >
            Frequently asked questions
          </h2>
          <p className="mt-4 text-lg tracking-tight text-muted-foreground text-center">
            If you can't find what you're looking for, please submit an issue
            through our GitHub repository or ask questions on our Discord.
          </p>
        </div>

        <Accordion
          type="single"
          collapsible
          className="w-full max-w-3xl mx-auto"
        >
          {faqs.map((column, columnIndex) => (
            <AccordionItem value={`${columnIndex}`} key={columnIndex}>
              <AccordionTrigger className="text-left">
                {column.question}
              </AccordionTrigger>
              <AccordionContent>{column.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Container>
    </section>
  );
}
