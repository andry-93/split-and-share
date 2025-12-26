export const formatCurrency = (
    value: number,
    currency: string | undefined,
    locale: string
) => {
    try {
        const formatted = new Intl.NumberFormat(locale, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);

        return `${formatted} ${currency}`;
    } catch {
        return `${value.toFixed(2)} ${currency}`;
    }
};
