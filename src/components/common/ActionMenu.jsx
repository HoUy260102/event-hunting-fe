import React, { useState } from 'react';
import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';

function ActionMenu({ actions, data }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (event) => {
    if (event) event.stopPropagation();
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        sx={{
          color: 'slate.500',
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          transition: 'all 0.2s',
          backgroundColor: open ? '#f1f5f9' : 'transparent',
          '&:hover': {
            backgroundColor: '#f1f5f9',
            color: '#10b981',
          }
        }}
      >
        <MoreVertIcon sx={{ fontSize: '20px' }} />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        disableScrollLock
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 10px 25px rgba(0,0,0,0.1))',
            mt: 1.5,
            minWidth: 180,
            borderRadius: '16px',
            border: '1px solid #f1f5f9',
            padding: '4px',
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
          },
        }}
      >
        {actions.map((action, index) => {
          const colorProp = action.color || 'text.secondary';

          // Determine if it's a special color for background mapping
          const isError = colorProp === 'error.main' || action.color === 'red';
          const isSuccess = colorProp === 'success.main' || action.color === 'emerald';
          const isInfo = colorProp === 'info.main' || action.color === 'blue';
          const isWarning = colorProp === 'warning.main' || action.color === 'amber';

          const getBgColor = () => {
            if (isError) return '#fef2f2';
            if (isSuccess) return '#f0fdf4';
            if (isInfo) return '#eff6ff';
            if (isWarning) return '#fffbeb';
            return '#f8fafc';
          };

          const getHoverColor = () => {
            if (isError) return '#dc2626';
            if (isSuccess) return '#059669';
            if (isInfo) return '#2563eb';
            if (isWarning) return '#d97706';
            return '#10b981';
          };

          return (
            <MenuItem
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                action.onClick(data);
                handleClose();
              }}
              sx={{
                borderRadius: '12px',
                mx: 1,
                my: 0.4,
                py: 1.2,
                px: 2,
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                color: colorProp,
                '&:hover': {
                  backgroundColor: getBgColor(),
                  color: getHoverColor(),
                  '& .MuiListItemIcon-root': {
                    color: 'inherit',
                    transform: 'translateX(3px) scale(1.1)',
                  }
                }
              }}
            >
              {action.icon && (
                <ListItemIcon
                  sx={{
                    color: 'inherit',
                    minWidth: '32px',
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    '& svg': {
                      fontSize: '18px'
                    }
                  }}
                >
                  {action.icon}
                </ListItemIcon>
              )}
              <ListItemText
                primary={action.label}
                primaryTypographyProps={{
                  fontSize: '13.5px',
                  fontWeight: 600,
                  letterSpacing: '-0.01em',
                  fontFamily: 'inherit'
                }}
              />
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
}

export default ActionMenu;