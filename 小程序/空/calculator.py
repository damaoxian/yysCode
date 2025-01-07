def calculator():
    print("简单计算器")
    print("支持的运算: +, -, *, /")
    
    while True:
        try:
            # 获取用户输入
            num1 = float(input("请输入第一个数字: "))
            operator = input("请输入运算符 (+, -, *, /): ")
            num2 = float(input("请输入第二个数字: "))
            
            # 执行计算
            if operator == '+':
                result = num1 + num2
            elif operator == '-':
                result = num1 - num2
            elif operator == '*':
                result = num1 * num2
            elif operator == '/':
                if num2 == 0:
                    print("错误：除数不能为0！")
                    continue
                result = num1 / num2
            else:
                print("无效的运算符！")
                continue
            
            # 显示结果
            print(f"结果: {num1} {operator} {num2} = {result}")
            
            # 询问是否继续
            choice = input("是否继续计算？(y/n): ")
            if choice.lower() != 'y':
                break
                
        except ValueError:
            print("错误：请输入有效的数字！")
            continue

if __name__ == "__main__":
    calculator()