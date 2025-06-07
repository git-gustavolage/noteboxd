type Node = {
  id: string;
  text: string;
  createdAt: Date;
  editCount: number;
  cursorPosition: number;
  active: boolean;
};

export default Node;
