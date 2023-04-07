import { Avatar, Badge } from "@mui/material";

interface PfpProps {
  size: number
  border: number
  pfp: { url: string, rarity: string, attributes: string[] } | null
  rank: string | null
};

const Pfp = ({size = 56, border = 2, pfp, rank}: Partial<PfpProps>) => {

  return (
    <Badge
      overlap="circular"
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      badgeContent={
        <Avatar
          variant="circular"
          src={`/rank-images/${rank?.toLowerCase()}.png`}
          sx={{ height: size / 2.8, width: size / 2.8 }}
        />
      }
    >
      <Avatar
        variant="rounded"
        src={pfp ? pfp.url : ''}
        sx={{
          height: size,
          width: size,
          border: 1,
          borderWidth: border,
          borderColor: `rarity.${pfp?.rarity.toLowerCase()}`,
          borderRadius: 2,
        }}
      />
    </Badge>
  )
};

export default Pfp;
