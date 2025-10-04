import React from "react";
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  Button,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
} from "@mui/material";
import Security from "@mui/icons-material/Security";
import Visibility from "@mui/icons-material/Visibility";
import Speed from "@mui/icons-material/Speed";
import Park from "@mui/icons-material/Park";
import CheckCircle from "@mui/icons-material/CheckCircle";
import Search from "@mui/icons-material/Search";
import DashboardIcon from "@mui/icons-material/Dashboard";
import { useNavigate } from "react-router-dom";
import { useWeb3 } from "../contexts/Web3Context";

const Home = () => {
  const navigate = useNavigate();
  const { account } = useWeb3();

  const features = [
    {
      icon: <Security color="primary" />,
      title: "Blockchain Security",
      description:
        "Immutable records powered by Hyperledger Besu ensure data integrity and prevent tampering.",
    },
    {
      icon: <Visibility color="primary" />,
      title: "Complete Transparency",
      description:
        "Track every ingredient from farm to your table with full supply chain visibility.",
    },
    {
      icon: <Speed color="primary" />,
      title: "Real-time Tracking",
      description:
        "Instant updates on product location, temperature, and handling throughout the journey.",
    },
    {
      icon: <Park />,
      title: "Sustainability",
      description:
        "Verify ethical sourcing and environmental practices at every step of production.",
    },
  ];

  const benefits = [
    "Instant product recalls when needed",
    "Verification of organic and quality certifications",
    "Temperature monitoring for food safety",
    "Supplier accountability and traceability",
    "Consumer confidence through transparency",
    "Regulatory compliance automation",
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Paper
        sx={{
          background: "linear-gradient(135deg, #00529B 0%, #0066CC 100%)",
          color: "white",
          py: 8,
          mb: 6,
          borderRadius: 3,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" component="h1" gutterBottom>
                Farm to Fork
                <br />
                <Box component="span" sx={{ color: "#FFC107" }}>
                  Traceability
                </Box>
              </Typography>
              <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
                Track your Rich's Pizza ingredients through every step of the
                supply chain with blockchain-powered transparency and security.
              </Typography>
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<Search />}
                  onClick={() => navigate("/trace")}
                  sx={{
                    bgcolor: "#FFC107",
                    color: "#000",
                    "&:hover": { bgcolor: "#FFB300" },
                    fontWeight: 600,
                  }}
                >
                  Trace a Product
                </Button>
                {account && (
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<DashboardIcon />}
                    onClick={() => navigate("/dashboard")}
                    sx={{
                      borderColor: "white",
                      color: "white",
                      "&:hover": {
                        borderColor: "#FFC107",
                        bgcolor: "rgba(255, 193, 7, 0.1)",
                      },
                    }}
                  >
                    Open Dashboard
                  </Button>
                )}
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  textAlign: "center",
                  "& img": {
                    maxWidth: "100%",
                    height: "auto",
                    borderRadius: 2,
                  },
                }}
              >
                {/* Placeholder for hero image */}
                <Paper
                  sx={{
                    height: 300,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "rgba(255, 255, 255, 0.1)",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <Typography variant="h6" sx={{ opacity: 0.7 }}>
                    Supply Chain Visualization
                  </Typography>
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Paper>

      {/* Features Section */}
      <Container maxWidth="lg">
        <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
          Why Choose Our Platform?
        </Typography>
        <Typography
          variant="h6"
          textAlign="center"
          color="text.secondary"
          sx={{ mb: 6 }}
        >
          Built with enterprise-grade blockchain technology for maximum trust
          and reliability
        </Typography>

        <Grid container spacing={4} sx={{ mb: 8 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  height: "100%",
                  textAlign: "center",
                  transition: "transform 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Benefits Section */}
        <Grid container spacing={6} alignItems="center" sx={{ mb: 8 }}>
          <Grid item xs={12} md={6}>
            <Typography variant="h4" component="h2" gutterBottom>
              Benefits for Everyone
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Our blockchain-based traceability system provides value across the
              entire supply chain ecosystem, from producers to consumers.
            </Typography>

            <List>
              {benefits.map((benefit, index) => (
                <ListItem key={index} sx={{ pl: 0 }}>
                  <ListItemIcon>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText primary={benefit} />
                </ListItem>
              ))}
            </List>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                p: 4,
                textAlign: "center",
                bgcolor: "primary.main",
                color: "white",
              }}
            >
              <Typography variant="h5" gutterBottom>
                Start Tracing Today
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
                Enter any product lot code to see its complete journey from farm
                to your table.
              </Typography>

              <Button
                variant="contained"
                size="large"
                onClick={() => navigate("/trace")}
                sx={{
                  bgcolor: "#FFC107",
                  color: "#000",
                  "&:hover": { bgcolor: "#FFB300" },
                  fontWeight: 600,
                }}
              >
                Try It Now
              </Button>
            </Paper>
          </Grid>
        </Grid>

        {/* Technology Stack */}
        <Paper sx={{ p: 4, textAlign: "center", bgcolor: "grey.50" }}>
          <Typography variant="h5" gutterBottom>
            Powered by Enterprise Technology
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: 2,
              flexWrap: "wrap",
              mt: 2,
            }}
          >
            <Chip label="Hyperledger Besu" color="primary" />
            <Chip label="Ethereum Smart Contracts" color="primary" />
            <Chip label="IBFT 2.0 Consensus" color="primary" />
            <Chip label="Private Transactions" color="primary" />
            <Chip label="React Frontend" color="primary" />
            <Chip label="Node.js API" color="primary" />
            <Chip label="PostgreSQL" color="primary" />
            <Chip label="IoT Integration" color="primary" />
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Home;
