import { Typography } from "~/ui/typography";

export default function Fail() {
  return (
    <div>
      <Typography variant="h2">Whoops!</Typography>
      <Typography variant="p">
        Looks like someone else played a move at the same time as you and theirs
        went through first.
      </Typography>
    </div>
  );
}
