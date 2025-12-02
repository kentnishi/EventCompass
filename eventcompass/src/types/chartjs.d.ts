import "chart.js";

declare module "chart.js" {

  interface PluginOptionsByType<_TType extends ChartType> {
    doughnutCenterText?: {
      text?: string;
    };
  }
}