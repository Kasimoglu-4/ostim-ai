package com.omer.ostim.ai.config;

import org.springframework.web.client.RestTemplate;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.StringHttpMessageConverter;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Configuration
public class RestTemplateConfig {

    public List<HttpMessageConverter<?>> customConverters() {
        List<HttpMessageConverter<?>> converters = new ArrayList<>();
        
        StringHttpMessageConverter stringConverter = new StringHttpMessageConverter(StandardCharsets.UTF_8);
        stringConverter.setSupportedMediaTypes(List.of(
            MediaType.TEXT_PLAIN,
            MediaType.ALL,
            MediaType.valueOf("application/x-ndjson")
        ));
        converters.add(stringConverter);
        
        MappingJackson2HttpMessageConverter jacksonConverter = new MappingJackson2HttpMessageConverter();
        jacksonConverter.setSupportedMediaTypes(List.of(
            MediaType.APPLICATION_JSON,
            MediaType.valueOf("application/x-ndjson")
        ));
        converters.add(jacksonConverter);
        
        return converters;
    }

    @Bean
    public RestTemplate restTemplate() {
        RestTemplate restTemplate = new RestTemplate();
        restTemplate.setMessageConverters(customConverters());
        return restTemplate;
    }
}