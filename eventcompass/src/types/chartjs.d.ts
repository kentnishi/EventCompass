import "chart.js";

declare module "chart.js" {

  interface PluginOptionsByType<TType extends ChartType> {
    doughnutCenterText?: {
      text?: string;
    };
  }
}