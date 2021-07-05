interface Question {
  correctAnswer: number;
  displayText: string;
  speechText: string;
}

interface QuestionFactory {
  displayText: string;
  question: () => Question;
}

const randomInt = (upper: number) => (Math.random() * upper) | 0;
const speechNumber = (n: number) => (n === 0 ? "ゼロ" : n);
const binaryQuestion = (
  displayText: string,
  maxX: number,
  maxY: number,
  q: (x: number, y: number) => [number, string, string]
): QuestionFactory => ({
  displayText,
  question: () => {
    const [correctAnswer, displayText, speechText] = q(randomInt(maxX), randomInt(maxY));
    return { correctAnswer, displayText, speechText };
  },
});

export const questionFactories: QuestionFactory[] = [
  binaryQuestion("20 までの たしざん", 20, 20, (x, y) => [x + y, `${x} + ${y} = `, `${speechNumber(x)} たす ${speechNumber(y)} は?`]),
  binaryQuestion("20 までの ひきざん", 20, 20, (x, y) => {
    if (x < y) {
      [x, y] = [y, x];
    }
    return [x - y, `${x} - ${y} = `, `${speechNumber(x)} ひく ${speechNumber(y)} は?`];
  }),
  binaryQuestion("かけざん くく", 10, 10, (x, y) => [x * y, `${x} × ${y} = `, `${speechNumber(x)} かける ${speechNumber(y)} は?`]),
];

export const QuestionAndAnswer = (props: { question: Question; answer?: number }) => {
  return (
    <div class="flex items-center justify-center whitespace-pre">
      <span>{props.question.displayText}</span>
      <span class="w-2ex">{props.answer}</span>
    </div>
  );
};

export const toAnswer = (word: string) => {
  const numeric = word && word.match(/(-?[0-9]+)[^0-9]*$/)?.[1];
  return numeric ? +numeric : undefined;
};
