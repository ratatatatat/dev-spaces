import React from 'react';
import TerminalItem from './TerminalItem';

const TerminalsList = ({ terminals, serviceId }: { terminals: string[], serviceId: number }) => {
    return (
        <div className=''>
            {terminals.map((terminal, index) => (
                <TerminalItem key={index} id={terminal} serviceId={serviceId} />
            ))}
        </div>
    );
};

export default TerminalsList;