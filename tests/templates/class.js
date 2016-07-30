class Foo {
  constructor(props: PropT): null {
    this.props = props;
  }

  @decorator
  add(a: number, b: number): number {
  }

  get name(): string {
    return this._name;
  }
}
