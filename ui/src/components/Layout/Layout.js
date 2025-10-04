import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  Menu,
  MenuItem,
  Chip,
} from "@mui/material";
import AccountBalanceWallet from "@mui/icons-material/AccountBalanceWallet";
import DashboardIcon from "@mui/icons-material/Dashboard";
import Search from "@mui/icons-material/Search";
import HomeIcon from "@mui/icons-material/Home";
import AdminPanelSettings from "@mui/icons-material/AdminPanelSettings";
import ExitToApp from "@mui/icons-material/ExitToApp";
import { useNavigate, useLocation } from "react-router-dom";
import { useWeb3 } from "../../contexts/Web3Context";

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    account,
    userRole,
    connectWallet,
    disconnectWallet,
    isConnecting,
    formatAddress,
    hasRole,
  } = useWeb3();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNavigate = (path) => {
    navigate(path);
    handleMenuClose();
  };

  const getRoleColor = (roles) => {
    if (!roles) return "default";
    if (roles.includes("ADMIN")) return "error";
    if (roles.includes("MANUFACTURER")) return "primary";
    if (roles.includes("FARMER")) return "success";
    if (roles.includes("LOGISTICS")) return "warning";
    if (roles.includes("RETAILER")) return "info";
    return "default";
  };

  const getRoleLabel = (roles) => {
    if (!roles || roles.length === 0) return "No Role";
    if (roles.length === 1) return roles[0].replace("_", " ");
    return `${roles.length} Roles`;
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar position="static" elevation={2}>
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              fontWeight: 600,
              cursor: "pointer",
            }}
            onClick={() => navigate("/")}
          >
            Rich's Pizza Traceability
          </Typography>

          {/* Navigation Buttons */}
          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1, mr: 2 }}>
            <Button
              color="inherit"
              startIcon={<HomeIcon />}
              onClick={() => navigate("/")}
              sx={{
                bgcolor:
                  location.pathname === "/"
                    ? "rgba(255,255,255,0.1)"
                    : "transparent",
              }}
            >
              Home
            </Button>

            <Button
              color="inherit"
              startIcon={<Search />}
              onClick={() => navigate("/trace")}
              sx={{
                bgcolor:
                  location.pathname === "/trace"
                    ? "rgba(255,255,255,0.1)"
                    : "transparent",
              }}
            >
              Trace Product
            </Button>

            {account && (
              <Button
                color="inherit"
                startIcon={<DashboardIcon />}
                onClick={() => navigate("/dashboard")}
                sx={{
                  bgcolor:
                    location.pathname === "/dashboard"
                      ? "rgba(255,255,255,0.1)"
                      : "transparent",
                }}
              >
                Dashboard
              </Button>
            )}

            {hasRole("ADMIN") && (
              <Button
                color="inherit"
                startIcon={<AdminPanelSettings />}
                onClick={() => navigate("/admin")}
                sx={{
                  bgcolor:
                    location.pathname === "/admin"
                      ? "rgba(255,255,255,0.1)"
                      : "transparent",
                }}
              >
                Admin
              </Button>
            )}
          </Box>

          {/* User Role Chip */}
          {account && userRole && (
            <Chip
              label={getRoleLabel(userRole)}
              size="small"
              color={getRoleColor(userRole)}
              sx={{ mr: 2 }}
            />
          )}

          {/* Wallet Connection */}
          {account ? (
            <>
              <Button
                color="inherit"
                startIcon={<AccountBalanceWallet />}
                onClick={handleMenuOpen}
                sx={{
                  border: "1px solid rgba(255,255,255,0.3)",
                  borderRadius: 2,
                }}
              >
                {formatAddress(account)}
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              >
                <MenuItem
                  onClick={() => navigator.clipboard.writeText(account)}
                >
                  Copy Address
                </MenuItem>
                <MenuItem onClick={disconnectWallet}>
                  <ExitToApp sx={{ mr: 1 }} />
                  Disconnect
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button
              color="inherit"
              variant="outlined"
              startIcon={<AccountBalanceWallet />}
              onClick={connectWallet}
              disabled={isConnecting}
              sx={{
                border: "1px solid rgba(255,255,255,0.5)",
                "&:hover": {
                  border: "1px solid rgba(255,255,255,0.8)",
                  bgcolor: "rgba(255,255,255,0.1)",
                },
              }}
            >
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container
        component="main"
        maxWidth="xl"
        sx={{
          flex: 1,
          py: 4,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {children}
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: "auto",
          backgroundColor: (theme) =>
            theme.palette.mode === "light"
              ? theme.palette.grey[200]
              : theme.palette.grey[800],
        }}
      >
        <Container maxWidth="xl">
          <Typography variant="body2" color="text.secondary" align="center">
            © 2025 Rich's Pizza Supply Chain Traceability Platform. Powered by
            Hyperledger Besu blockchain technology.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;
