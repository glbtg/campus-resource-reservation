package com.intern.campusreserve.security;

import com.intern.campusreserve.common.BizException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;

@Component
public class JwtTokenUtil {
    private static final String HMAC_SHA256 = "HmacSHA256";
    private static final String HEADER = base64Url("{\"alg\":\"HS256\",\"typ\":\"JWT\"}");

    @Value("${app.jwt.secret}")
    private String secret;

    @Value("${app.jwt.expire-minutes:1440}")
    private long expireMinutes;

    public String createToken(LoginUser user) {
        long expireAt = Instant.now().plusSeconds(expireMinutes * 60).getEpochSecond();
        String payload = user.getId() + "|" + safe(user.getUsername()) + "|" + safe(user.getNickname()) + "|" + safe(user.getRole()) + "|" + expireAt;
        String payloadEncoded = base64Url(payload);
        String signingInput = HEADER + "." + payloadEncoded;
        return signingInput + "." + sign(signingInput);
    }

    public LoginUser parseToken(String token) {
        if (token == null || token.isBlank()) {
            throw new BizException(401, "缺少登录凭证");
        }
        String[] arr = token.split("\\.");
        if (arr.length != 3) {
            throw new BizException(401, "登录凭证格式错误");
        }
        String signingInput = arr[0] + "." + arr[1];
        String signature = sign(signingInput);
        if (!signature.equals(arr[2])) {
            throw new BizException(401, "登录凭证签名校验失败");
        }
        String payload = new String(Base64.getUrlDecoder().decode(arr[1]), StandardCharsets.UTF_8);
        String[] fields = payload.split("\\|", -1);
        if (fields.length != 5) {
            throw new BizException(401, "登录凭证内容异常");
        }
        long expireAt = Long.parseLong(fields[4]);
        if (Instant.now().getEpochSecond() > expireAt) {
            throw new BizException(401, "登录状态已过期，请重新登录");
        }
        return new LoginUser(Long.parseLong(fields[0]), fields[1], fields[2], fields[3]);
    }

    private String sign(String data) {
        try {
            Mac mac = Mac.getInstance(HMAC_SHA256);
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), HMAC_SHA256));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(mac.doFinal(data.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new BizException("Token 签名失败");
        }
    }

    private static String base64Url(String data) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(data.getBytes(StandardCharsets.UTF_8));
    }

    private String safe(String value) {
        if (value == null) {
            return "";
        }
        return value.replace("|", "_");
    }
}
