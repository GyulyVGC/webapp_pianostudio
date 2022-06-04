import 'bootstrap/dist/css/bootstrap.min.css';
import { useContext } from 'react';
import nightModeContext from './nightModeContext';

function MyFooter() {
    const nightMode = useContext(nightModeContext).nightMode;

    let stylish = nightMode ?
        { background: "linear-gradient(to right,#FF4E50,#F9D423)", height: '5%' } :
        { background: "linear-gradient(to right,#076585,#fff)", height: '5%' };
    return (
        <footer className={"fixed-bottom mt-auto text-dark"}
            style={stylish}>
            <h5>
                <span style={{ marginLeft: '37%' }}></span>
                <a rel="noreferrer" href="http://media.polito.it/wordpress/classes/aw1/index.html" title="Sito del corso" target="_blank"
                    className={"link-dark"}>
                    Applicazioni Web I - A.A. 2021/2022</a>
                <span style={{ marginLeft: '20%' }}></span>
                Giuliano Bellini ©
            </h5>
        </footer>
    );
}

export default MyFooter;