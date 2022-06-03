import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Button, Alert, Form } from 'react-bootstrap';
import nightModeContext from './nightModeContext';
import { useState, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';

function MyForm(props) {
  const navigate = useNavigate();
  const nightMode = useContext(nightModeContext).nightMode;
  let { iD } = useParams();
  const id = Number(iD);

  const filmToEdit = props.films.find((f) => f.id === id);

  const [errorMsg, setErrorMsg] = useState('');

  const [title, setTitle] = useState(filmToEdit ? filmToEdit.title : '');
  const [favorite, setFavorite] = useState(filmToEdit ? filmToEdit.favorite : false);
  const [rating, setRating] = useState(filmToEdit ? filmToEdit.rating : 0);
  const [date, setDate] = useState(filmToEdit ? (filmToEdit.date ? filmToEdit.date : '') : dayjs().toString());

  const handleSubmit = (event) => {
    event.preventDefault();
    if (title.trim().length === 0) {
      setErrorMsg('Film title must be at least one non-space character!');
    } else if (date && dayjs(date).isAfter(dayjs())) {
      setErrorMsg('Future dates are not allowed!');
    } else {
      const newFilm = {
        id: filmToEdit ? id : '',title: title.trim(),
        favorite: favorite, date: date ? dayjs(date).format('YYYY-MM-DD') : null, rating: Number(rating)
      }

      props.addOrEdit(newFilm);
      navigate(-1);
    }
  }

  return (
    <>
      <Container>
        <Row>
          <Col>
            <h1>{filmToEdit ? 'Edit film' : 'Add film'} </h1>
          </Col>
        </Row>
        <Row>
          {errorMsg ? <Alert variant='danger' onClose={() => setErrorMsg('')} dismissible>{errorMsg}</Alert> : false}
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col sm={5}>
                <Form.Group>
                  <Form.Label>Film title</Form.Label>
                  <Form.Control placeholder='Enter film title' required={true} value={title} onChange={ev => setTitle(ev.target.value)}></Form.Control>
                </Form.Group>
                <br />
                <Form.Group>
                  <Form.Label>Date</Form.Label>
                  <Form.Control type='date' value={date ? dayjs(date).format('YYYY-MM-DD') : ''} onChange={ev => setDate(ev.target.value)} />
                </Form.Group>
              </Col >
              <Col sm={2}>
                {favorite ?
                  <Form.Group className="mb-3" controlId="formBasicCheckbox">
                    <Form.Label>Favorite</Form.Label>
                    <Form.Check defaultChecked type="checkbox" className={favorite ? 'defaultChecked' : ''}
                      onChange={ev => setFavorite(favorite => !favorite)} />
                  </Form.Group>
                  :
                  <Form.Group className="mb-3" controlId="formBasicCheckbox">
                    <Form.Label>Favorite</Form.Label>
                    <Form.Check type="checkbox" className={favorite ? 'defaultChecked' : ''}
                      onChange={ev => setFavorite(favorite => !favorite)} />
                  </Form.Group>
                }
                <br />
                <Form.Group>
                  <Form.Label>Rating</Form.Label>
                  <Form.Control className='w-50' type='number' min={0} max={5} required={true} value={rating} onChange={ev => setRating(ev.target.value)} />
                </Form.Group>
                <br /><br />
              </Col>
            </Row>
            <span style={{ marginLeft: '20%' }}></span>
            <Button type='submit' variant={nightMode ? 'warning' : 'secondary'} >Save</Button>
            <span style={{ marginLeft: '20px' }}></span>
            <Button onClick={() => navigate(-1)} variant='danger' >Cancel</Button>
          </Form>
        </Row>
      </Container>
    </>
  );
}

export default MyForm;