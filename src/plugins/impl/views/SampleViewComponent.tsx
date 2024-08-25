import React, { useEffect, useState } from 'react';
import './SampleViewComponent.scss'; // Assuming the SCSS file is named SampleViewComponent.scss

interface Trade {
    id: number;
    currencyPair: string;
    tradeDate: string;
    notional: number;
    price: number;
}

const trades: Trade[] = [
    {
        id: 1,
        currencyPair: 'EUR/USD',
        tradeDate: '2023-04-01',
        notional: 1000000,
        price: 1.1,
    },
    {
        id: 2,
        currencyPair: 'GBP/USD',
        tradeDate: '2023-04-02',
        notional: 2000000,
        price: 1.3,
    },
    // Add more sample trades...
];

export const SampleViewComponent: React.FC = () => {
    const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);

    useEffect(() => {
        // Automatically select the first trade on component mount
        if (trades.length > 0) {
            setSelectedTrade(trades[0]);
        }
    }, []); // The empty array ensures this effect runs only once on mount

    const handleSelectionChange = (trade: Trade) => {
        setSelectedTrade(trade);
        // Additional actions on selection change...
    };

    return (
        <div className="trade-table-container">
            <table className="trade-table">
                <thead>
                    <tr>
                        <th>Currency Pair</th>
                        <th>Trade Date</th>
                        <th>Notional</th>
                        <th>Price</th>
                    </tr>
                </thead>
                <tbody>
                    {trades.map((trade) => (
                        <tr
                            key={trade.id}
                            onClick={() => handleSelectionChange(trade)}
                            className={
                                selectedTrade?.id === trade.id ? 'selected' : ''
                            }
                        >
                            <td>{trade.currencyPair}</td>
                            <td>{trade.tradeDate}</td>
                            <td>{trade.notional.toLocaleString()}</td>
                            <td>{trade.price}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {selectedTrade && (
                <div>
                    Selected Trade: {selectedTrade.currencyPair} -{' '}
                    {selectedTrade.tradeDate}
                </div>
            )}
        </div>
    );
};
