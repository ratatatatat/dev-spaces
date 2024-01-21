import React from 'react';
import { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { useDispatch } from 'react-redux';
import { deleteTerminalAction } from '../../redux/slices/service';
import 'xterm/css/xterm.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { Button } from 'react-bootstrap';


const TerminalItem = ({ id, serviceId }: { id: string, serviceId: number }) => {
    const terminalRef = useRef<HTMLDivElement>(null);
    const dispatch = useDispatch(); // Get the dispatch function

    useEffect(() => {
        const term = new Terminal();
        if (terminalRef.current) {
            window.electron.ipcRenderer.on('service-terminal-data', (event, {
                serviceId: receivedServiceId,
                terminalId,
                data
            }) => {
                if (receivedServiceId === serviceId && terminalId === id) {
                    term.write(data);
                }
            })
            term.open(terminalRef.current);
            term.onData((data) => {
                window.electron.ipcRenderer.send('service-terminal-data', {
                    serviceId,
                    terminalId: id,
                    data
                });
            });
        }
    }, []);

    const handleClose = () => {
        dispatch(deleteTerminalAction(serviceId, id) as any); // Dispatch the action
    };

    return (
        <div id={id} className='w-full my-3 flex flex-row'>
            <div className='p-1 bg-gray-200'>
                <Button variant={"danger"} onClick={handleClose}>
                    <FontAwesomeIcon icon={faXmark} />
                </Button>
            </div>
            <div className='flex-grow'>
                <div style={{
                    paddingLeft: '10px',
                    background: '#000',
                }} ref={terminalRef}>
                </div>
            </div>
        </div>
    );
};

export default TerminalItem;
