import { useSearchParams } from "@remix-run/react";
import { z } from "zod";
import { zfd } from "zod-form-data";
import { Typography } from "~/ui/typography";

const schema = zfd.formData({
  legality: z.enum(["occupied-black", "occupied-white", "ko", "suicide"]),
});

export default function Fail() {
  const [searchParams] = useSearchParams();
  const { legality } = schema.parse(searchParams);

  const legalityMessage = () => {
    switch (legality) {
      case "ko":
        return "Ko (or superko) violation";
      case "occupied-black":
      case "occupied-white":
        return "Point is already occupied by a stone";
      case "suicide":
        return "Self-capturing move";
    }
  };

  return (
    <div className="max-w-lg m-auto my-12 text-gray-100">
      <Typography variant="h2">Oops!</Typography>
      <Typography variant="largeText" className="mt-4">
        Illegal move
      </Typography>
      <Typography variant="p">
        The move you played was illegal. Reason:{" "}
        <strong>{legalityMessage()}</strong>.
      </Typography>
      <Typography variant="p">
        It's possible someone else played a move at the same time as you and
        theirs went through first.
      </Typography>
    </div>
  );
}
