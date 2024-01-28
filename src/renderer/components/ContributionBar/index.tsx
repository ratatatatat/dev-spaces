import React from 'react';
import Card from 'react-bootstrap/Card';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import packageJson from '../../../../package.json';


const ContributeCard = () => {
    const handleClick = () => {
        const repoUrl = packageJson.repository.url.replace('git+', '');
        window.electron.ipcRenderer.send('open-external', {
            url: repoUrl
        });
    };
    return (
        <Card>
            <Card.Body>
                <Card.Text>
                    <div className='hover:underline cursor-pointer' onClick={handleClick}>
                        <FontAwesomeIcon size={"xl"} style={{
                            marginRight: '10px'
                        }} icon={faGithub} />
                        Open source and looking for contributions.
                    </div>
                </Card.Text>
            </Card.Body>
        </Card>
    );
};

export default ContributeCard;