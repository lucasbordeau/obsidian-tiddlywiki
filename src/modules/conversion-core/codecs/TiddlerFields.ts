export type TiddlerFields = {
  title: string;
  text: string;
  tags?: string;
  created?: string;
  modified?: string;
  type?: string;
  [field: string]: string | undefined;
};
