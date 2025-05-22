import { UserRole } from "../core/blockchain/auth/types.ts";

/**
 * 授权服务
 * 提供身份验证和令牌生成功能
 */
export class AuthService {
  /**
   * 验证用户凭据
   * @param username 用户名
   * @param password 密码
   * @returns 验证结果
   */
  static async authenticate(username: string, password: string): Promise<{
    success: boolean;
    role?: UserRole;
    nodeId?: string;
    message?: string;
  }> {
    try {
      // 在实际项目中，应该检查数据库中的用户凭据
      // 这里简单演示几个测试账号

      // 管理员账号
      if (username === "admin" && password === "admin123") {
        return {
          success: true,
          role: UserRole.ADMIN,
          nodeId: "admin-master-node"
        };
      }
      
      // 数据节点账号
      if (username.startsWith("node") && password === "node123") {
        // 从用户名中提取节点编号（如node1, node2）
        const nodeNumber = username.replace("node", "");
        return {
          success: true,
          role: UserRole.NODE,
          nodeId: `data-node-${nodeNumber}`
        };
      }
      
      // 普通用户账号
      if (username === "user" && password === "user123") {
        return {
          success: true,
          role: UserRole.USER,
          nodeId: "regular-user"
        };
      }
      
      return {
        success: false,
        message: "无效的用户名或密码"
      };
    } catch (error) {
      console.error("身份验证失败:", error);
      return {
        success: false,
        message: "身份验证失败"
      };
    }
  }
  
  /**
   * 生成JWT令牌
   * @param role 用户角色
   * @param nodeId 节点ID
   * @param expiresIn 过期时间（秒）
   * @returns 令牌
   */
  static generateToken(role: UserRole, nodeId: string, expiresIn = 3600): string {
    // 计算过期时间
    const exp = Math.floor(Date.now() / 1000) + expiresIn;
    
    // 创建令牌负载
    const payload = {
      role,
      nodeId,
      exp,
      iat: Math.floor(Date.now() / 1000)
    };
    
    // 简单JWT实现 - 实际项目中应使用完整的JWT库
    // 对负载进行Base64URL编码
    const encodedPayload = btoa(JSON.stringify(payload))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");
    
    // 对header进行Base64URL编码（固定值）
    const header = { alg: "none", typ: "JWT" };
    const encodedHeader = btoa(JSON.stringify(header))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");
    
    // 注意：这是一个不安全的令牌实现，仅用于演示
    // 实际项目中应使用适当的签名
    return `${encodedHeader}.${encodedPayload}.`;
  }
} 