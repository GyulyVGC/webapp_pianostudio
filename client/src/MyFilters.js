import 'bootstrap/dist/css/bootstrap.min.css';
import { Col, ListGroup } from 'react-bootstrap'; 
import { useContext } from 'react';
import nightModeContext from './nightModeContext';
import { useNavigate } from 'react-router-dom';

function MyFilters( props ) {
    const nightMode = useContext(nightModeContext).nightMode;
    let variant = nightMode ? 'dark' : 'secondary';
    const navigate = useNavigate();
    return (
        <Col sm={4} style={{borderRight:'1px dotted'}}>
            <ListGroup >
                <ListGroup.Item action variant={variant} 
                className = {props.selettore === 'All' ? 'active' : ''}
                onClick={() => {
                    navigate('/films');
                    props.changeSelettore('All');
                    props.setDirty(true);
                    props.setInitialLoading(true);
                }}>
                    All
                </ListGroup.Item>
                <ListGroup.Item action variant={variant}
                className = {props.selettore === 'Favorites' ? 'active' : ''}
                onClick={() => {
                    navigate('/films/favorites');
                    props.changeSelettore('Favorites');
                    props.setDirty(true);
                    props.setInitialLoading(true);
                }} >
                    Favorites
                </ListGroup.Item>
                <ListGroup.Item action variant={variant} 
                className = {props.selettore === 'Best rated' ? 'active' : ''}
                onClick={() => {
                    navigate('/films/bestRated');
                    props.changeSelettore('Best rated');
                    props.setDirty(true);
                    props.setInitialLoading(true);
                }}>
                    Best rated
                </ListGroup.Item>
                <ListGroup.Item action variant={variant}
                className = {props.selettore === 'Seen last month' ? 'active' : ''}
                onClick={() => {
                    navigate('/films/seenLastMonth');
                    props.changeSelettore('Seen last month');
                    props.setDirty(true);
                    props.setInitialLoading(true);
                }}>
                    Seen last month
                </ListGroup.Item>
                <ListGroup.Item action variant={variant}
                className = {props.selettore === 'Unseen' ? 'active' : ''}
                onClick={() => {
                    navigate('/films/unseen');
                    props.changeSelettore('Unseen');
                    props.setDirty(true);
                    props.setInitialLoading(true);
                }}>
                    Unseen
                </ListGroup.Item>
            </ListGroup>
        </Col>
    );
}

export default MyFilters;