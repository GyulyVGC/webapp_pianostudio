import * as React from 'react';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import CloseIcon from '@mui/icons-material/Close';


function MyAlerts(props) {
    const [open, setOpen] = React.useState(true);

    return (
        <Box sx={{ width: '100%', position: 'sticky', top: props.position }}>
            <Collapse in={open}>
                <Alert sx={{height: '7vh'}} severity={props.type}
                    action={
                        <IconButton
                            aria-label="close"
                            color="inherit"
                            size="small"
                            onClick={() => {
                                setOpen(false);
                                props.setMessage(() => '');
                            }}
                        >
                            <CloseIcon fontSize="inherit" />
                        </IconButton>
                    }>
                    {props.message}
                </Alert>
            </Collapse>
        </Box>
    );
}

export default MyAlerts;