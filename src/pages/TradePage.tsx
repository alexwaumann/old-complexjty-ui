import { Box, Container, Grid, Paper } from "@mui/material";

import Trade from "../components/Trade";


const TradePage = () => {
  const positions = [1, 2, 3];

  return (
    <Container maxWidth="xl">
      <Trade />
      <Box m={2} />
      <Grid container spacing={2}>
        {positions.map((value) => (
          <Grid item key={value} xs={12} md={6} lg={4}>
            <Paper sx={{ height: 250, p: 2, borderRadius: 2 }}>
              ACTIVE POSITION SUMMARY
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  )
};

export default TradePage;
