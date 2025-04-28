import { useState } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from 'lucide-react';
import { BarChart, Bar, AreaChart, Area, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { Button } from "@/components/ui/button";


type Props = {
    dataType: 'summary' | 'daily';
    setDataType: (dataType: 'summary' | 'daily') => void;
    chartData: { category: string; amount: number }[] | { date: string; amount: number }[];
}

// Chart configuration
const chartConfig = {
    amount: {
        label: "Amount",
        color: "hsl(var(--chart-1))",
    },
} satisfies { [key: string]: { label: string; color: string } };

const ChartSection = ({ dataType, setDataType, chartData }: Props) => {
    const [chartType, setChartType] = useState<'bar' | 'area'>('bar');

    return (
        <>
            <div className="flex gap-2 ml-auto w-fit">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                            {chartType === 'bar' ? 'Bar Chart' : 'Area Chart'}
                            <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => setChartType('bar')}>
                            Bar Chart
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setChartType('area')}>
                            Area Chart
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                            {dataType === 'summary' ? 'Summary' : 'Daily'}
                            <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => setDataType('summary')}>
                            Summary
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDataType('daily')}>
                            Daily
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="mt-6">
                <ChartContainer config={chartConfig} className="h-[300px] md:w-fit w-[80vw]">
                    {chartType === 'bar' ? (
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey={dataType === 'summary' ? 'category' : 'date'}
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                            />
                            <YAxis />
                            <ChartTooltip content={<ChartTooltipContent className="accent-rose-500" />} />
                            <Bar
                                dataKey="amount"
                                fill="var(--chart-bg)"
                                stroke="var(--chart-stroke)"
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    ) : (
                        <AreaChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey={dataType === 'summary' ? 'category' : 'date'}
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                            />
                            <YAxis />
                            <ChartTooltip content={<ChartTooltipContent className="accent-rose-500" />} />
                            <Area
                                type="monotone"
                                dataKey="amount"
                                fill="var(--chart-bg)"
                                stroke="var(--chart-stroke)"
                            />
                        </AreaChart>
                    )}
                </ChartContainer>
            </div>
        </>
    )
}

export default ChartSection