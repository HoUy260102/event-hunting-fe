import React, { useState } from 'react';
import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';

function ActionMenu({ actions, data }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    // Ngăn chặn sự kiện click lan ra ngoài (nếu menu nằm trong row của table)
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (event) => {
    if (event) event.stopPropagation();
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton onClick={handleClick}>
        <MoreVertIcon />
      </IconButton>
      
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        {actions.map((action, index) => (
          <MenuItem 
            key={index} 
            onClick={(e) => {
              e.stopPropagation();
              action.onClick(data); 
              handleClose();
            }}
            sx={{ 
              color: action.color || 'inherit',
              fontSize: '14px' 
            }}
          >
            {action.icon && (
              <ListItemIcon 
                sx={{ 
                  color: 'inherit', 
                  minWidth: '32px' 
                }}
              >
                {action.icon}
              </ListItemIcon>
            )}
            <ListItemText primary={action.label} />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

export default ActionMenu;