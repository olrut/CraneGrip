import React, { useEffect, useRef, useState } from 'react';
import { Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import Colors from "@/constants/Colors";

const CHART_DURATION = 10; // Seconds
const UPDATE_INTERVAL = 500; // Milliseconds (lower = faster refresh)
const SAMPLE_COUNT = Math.max(1, Math.ceil((CHART_DURATION * 1000) / UPDATE_INTERVAL));

const WeightChart = ({ weight, maxWeight }: { weight: number, maxWeight: number }) => {
    const [data, setData] = useState<number[]>(Array(SAMPLE_COUNT).fill(0));
    const dataRef = useRef<number[]>(Array(SAMPLE_COUNT).fill(0));
    const weightRef = useRef<number>(0);
    useEffect(() => { weightRef.current = weight; }, [weight]);


    // Update the chart data every interval (UPDATE_INTERVAL)
    useEffect(() => {
        const interval = setInterval(() => {
            dataRef.current = [...dataRef.current.slice(1), weightRef.current];
            setData([...dataRef.current]);
        }, UPDATE_INTERVAL);
        return () => clearInterval(interval);
    }, []);

    return (
            <LineChart
                data={{
                    labels: Array(SAMPLE_COUNT).fill(''), // Fill labels with empty strings
                    datasets: [
                        {
                            data: data,
                            color: () => Colors.dark.connected, // Line color
                            strokeWidth: 3,
                        },
                        {
                            data: Array(data.length).fill(maxWeight), // Max/threshold line
                            color: () => Colors.dark.resetButton, // Max line color
                            withDots: false,
                            strokeWidth: 2,
                        },
                    ],
                }}
                width={Dimensions.get('window').width}
                height={Dimensions.get('window').height / 3}
                yAxisSuffix=" kg"
                yAxisInterval={0.1}
                chartConfig={{
                    backgroundGradientFrom: Colors.dark.background,
                    backgroundGradientTo: Colors.dark.background,
                    fillShadowGradientFrom: Colors.dark.connected,
                    fillShadowGradientTo: Colors.dark.connected,
                    fillShadowGradientOpacity: 0.18,
                    decimalPlaces: 1,
                    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`, // Axes/color
                    labelColor: () =>  'rgba(255,255,255,0.7)', // Label color
                    style: {
                        borderRadius: 0,
                    },
                    propsForDots: {
                        r: '0',
                    },
                    propsForBackgroundLines: {
                        strokeWidth: 1,
                        stroke: 'rgba(255,255,255,0.06)'
                    },
                }}
                withHorizontalLabels={true}
                withVerticalLabels={false}
                withInnerLines={true}
                withOuterLines={false}
                bezier
            />
    );
};

export default WeightChart;
