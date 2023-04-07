import {
  Container, Grid, Paper 
} from "@mui/material";

const TradePage = () => {
  const positions = [1, 2, 3, 4, 5];

  return (
    <Container maxWidth="xl">
      <Grid container spacing={2}>

        <Grid item xs={12}>
          <Paper sx={{ height: 72, p: 2, borderRadius: 2 }}>
            CHART CONTROLS
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ height: 350, p: 2, borderRadius: 2 }}>
            CHART
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ height: 300, p: 2, borderRadius: 2 }}>
            TRADE INPUTS
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ height: 300, p: 2, borderRadius: 2 }}>
            TRADE SUMMARY ESTIMATE
          </Paper>
        </Grid>

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
