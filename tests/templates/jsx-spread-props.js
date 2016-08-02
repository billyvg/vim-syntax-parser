const Component = () => {
  return (
    <div
      {...{
         ...this.props,
         className: 'centered',
         foo: bar,
      }}
    >
      {foo}
    </div>
  );
};
