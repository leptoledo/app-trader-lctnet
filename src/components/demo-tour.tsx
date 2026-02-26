"use client"

import { useEffect, useState } from "react"
import { driver } from "driver.js"
import "driver.js/dist/driver.css"

export function DemoTour() {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (!mounted) return;

        const isDemo = new URLSearchParams(window.location.search).get("demo") === "true";
        if (!isDemo) return;

        // Ensure elements are rendered before starting the tour
        const timer = setTimeout(() => {
            const driverObj = driver({
                showProgress: true,
                animate: true,
                doneBtnText: "Finalizar Tour",
                nextBtnText: "Próximo",
                prevBtnText: "Anterior",
                popoverClass: "dark:bg-[#0b1220] dark:text-white border-slate-200 dark:border-slate-800",
                steps: [
                    {
                        popover: {
                            title: "Bem-vindo ao Trader Journal",
                            description: "Esse é o dashboard principal onde todos os resultados ganham vida. Vamos fazer um tour rápido pelas ferramentas de um trader de elite.",
                            side: "bottom",
                            align: "center"
                        }
                    },
                    {
                        element: "#tour-date-filter",
                        popover: {
                            title: "Filtros Granulares",
                            description: "Veja seus resultados desta semana, mês ou selecione um período customizado. As estatísticas são recálculadas em tempo real.",
                            side: "bottom",
                            align: "start"
                        }
                    },
                    {
                        element: "#tour-consistency",
                        popover: {
                            title: "Mapa de Consistência",
                            description: "Sua sobrevivência no mercado. Visualize instantaneamente os dias de ganho e derrota para manter a disciplina sob controle na semana atual.",
                            side: "bottom",
                            align: "start"
                        }
                    },
                    {
                        element: "#tour-equity",
                        popover: {
                            title: "A Curva do Patrimônio",
                            description: "Acompanhe de perto a evolução do seu capital, seja pelo Saldo Líquido ou analisando quedas bruscas no Drawdown.",
                            side: "bottom",
                            align: "start"
                        }
                    },
                    {
                        element: "#tour-profit-factor",
                        popover: {
                            title: "Fator de Lucro",
                            description: "O índice definitivo para saber se a sua estratégia se paga a longo prazo. Um Profit Factor acima de 2.0 representa maestria operacional.",
                            side: "left",
                            align: "center"
                        }
                    },
                    {
                        element: "#tour-recent-trades",
                        popover: {
                            title: "Auditoria Recente",
                            description: "Aqui aparecem as últimas operações registradas do seu diário. Identifique falhas e estude seus grandes acertos mantendo tudo organizado.",
                            side: "top",
                            align: "center"
                        }
                    },
                    {
                        element: "#tour-new-trade",
                        popover: {
                            title: "Sua Vez!",
                            description: "Que tal criar o seu cadastro agora mesmo e lançar seu primeiro Win na plataforma? Acostume se a não depender mais de planilhas de excel.",
                            side: "left",
                            align: "center"
                        }
                    }
                ]
            });

            driverObj.drive();
        }, 1000);

        return () => clearTimeout(timer);
    }, [mounted])

    return null
}
