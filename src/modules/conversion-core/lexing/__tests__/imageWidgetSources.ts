export const imageWidgetSources = [
  '[img alt="[[literal]]" tooltip=\'A > B\'[caption|photo.svg]]',
  '[img width={{{ [<width>multiply[2]] }}} class=<<classes "inside >> quote">> [photo.svg]]',
  '[img tooltip="""[[literal]] and "quotes" here""" width=`${width}$px` [photo.svg]]',
  '[img alt="C:\\media\\" [photo.svg]]',
  '[img tooltip=```single ` and [[literal]]``` [photo.svg]]',
] as const;
