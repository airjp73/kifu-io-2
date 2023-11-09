import { Typography } from "~/ui/typography";

export default function Fail() {
  return (
    <div className="max-w-lg m-auto my-12 text-gray-100">
      <Typography variant="h2">Oops!</Typography>
      <Typography variant="largeText" className="mt-4">
        Stale game state
      </Typography>
      <Typography variant="p">
        Looks like someone else played a move at the same time as you and theirs
        went through first.
      </Typography>
    </div>
  );
}
