import React, { ReactNode, useEffect, useState } from 'react';
// @ts-expect-error - This import is not yet available
import { LocalEventBus } from '@composaic/plugins/views/LocalEventBus';
// @ts-expect-error - This import is not yet available
import { SignalService } from '@composaic/services/SignalService';

import './PluginTestComponent.scss';

// Assuming the Trade type is defined elsewhere, import it
// import { Trade } from './path-to-trade-type-definition';

type Trade = {
    currencyPair: string;
    tradeDate: string;
};
interface TradeDetailViewProps {
    trade: Trade;
    events: LocalEventBus; // Event handler for when "Use trade" is clicked
}

const referenceNumberMap: { [key: string]: string } = {
    'EUR/USD': '12345',
    'GBP/USD': '67890',
    'USD/JPY': '54321',
};

export const PluginTestComponent: React.FC<TradeDetailViewProps> = ({
    events,
}): ReactNode => {
    const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
    const [referenceNumber, setReferenceNumber] = useState<string>('');

    const tradeChangeHandler = (trade: Trade) => {
        console.log('Selected trade changed:', trade);
        setSelectedTrade(trade);
        setReferenceNumber(referenceNumberMap[trade.currencyPair]);
    };

    useEffect(() => {
        (async () => {
            const signalService = await SignalService.getInstance();
            await signalService.send({
                type: 'notification',
                payload: { message: 'Hello from Signals' },
            });
        })();

        events.on('selectedTradeChanged', tradeChangeHandler);

        return () => {
            events.off('selectedTradeChanged', tradeChangeHandler);
        };
    }, [events]);

    const onUseTrade = () => {
        events.emit('useReference', referenceNumber);
    };

    return (
        selectedTrade && (
            <div className="plugin-test-view">
                <p>Currency Pair: {selectedTrade.currencyPair}</p>
                <p>Trade Date: {selectedTrade.tradeDate}</p>
                <p>
                    Reference Number: {referenceNumber}{' '}
                    <button onClick={onUseTrade}>Use this ref</button>
                </p>
            </div>
        )
    );
};
