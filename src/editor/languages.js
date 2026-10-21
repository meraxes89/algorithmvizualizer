export const LANGUAGE_ICONS = {
  c:          'C',
  cpp:        'C++',
  java:       'JAVA',
  javascript: 'JS',
  python:     'PY',
};

// Wandbox compiler IDs — confirmed from https://wandbox.org/api/list.json
export const WANDBOX_COMPILERS = {
  c:          'gcc-13.2.0-c',
  cpp:        'gcc-13.2.0',
  java:       'openjdk-jdk-21+35',
  javascript: 'nodejs-20.2.0',
  python:     'cpython-3.12.0',
};

export const LANGUAGES = {
  c: {
    name: 'C',
    codexLang: 'c',
    monacoLang: 'c',
    fileName: 'main.c',
    template: `#include <stdio.h>

int main() {
    printf("Welcome to the Playground!\\n");
    return 0;
}`
  },
  cpp: {
    name: 'C++',
    codexLang: 'cpp',
    monacoLang: 'cpp',
    fileName: 'main.cpp',
    template: `#include <iostream>
using namespace std;

int main() {
    cout << "Welcome to the Playground!" << endl;
    return 0;
}`
  },
  java: {
    name: 'Java',
    codexLang: 'java',
    monacoLang: 'java',
    fileName: 'Main.java',
    template: `public class Main {
    public static void main(String[] args) {
        System.out.println("Welcome to the Playground!");
    }
}`
  },
  javascript: {
    name: 'JavaScript',
    codexLang: 'js',
    monacoLang: 'javascript',
    fileName: 'main.js',
    template: `console.log("Welcome to the Playground!");
`
  },
  python: {
    name: 'Python',
    codexLang: 'py',
    monacoLang: 'python',
    fileName: 'main.py',
    template: `print("Welcome to the Playground!")
`
  },
};
