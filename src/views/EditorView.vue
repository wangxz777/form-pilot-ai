<template>
  <div class="editor-view">
    <header class="editor-toolbar">
      <div class="toolbar-identity">
        <span class="toolbar-brand">FormPilot AI</span>
        <span class="toolbar-divider" aria-hidden="true"></span>
        <h1 class="toolbar-form-name">求职申请表</h1>
        <span class="toolbar-save-status">已自动保存</span>
      </div>

      <nav class="toolbar-actions" aria-label="表单操作">
        <el-button>预览</el-button>
        <el-button>导入</el-button>
        <el-button>导出</el-button>
        <el-button type="primary">AI 生成</el-button>
      </nav>
    </header>

    <div class="editor-layout">
      <aside class="editor-panel field-panel" aria-labelledby="field-list-title">
        <div class="panel-heading">
          <div class="panel-title-group">
            <h2 id="field-list-title">字段</h2>
            <span class="field-count">0</span>
          </div>
          <el-button type="primary" plain>添加字段</el-button>
        </div>
        <p class="panel-empty-state">暂未添加字段</p>
      </aside>

      <main class="preview-panel" aria-labelledby="preview-title">
        <h2 id="preview-title">实时预览</h2>
        <section class="form-canvas" aria-labelledby="form-title">
          <h3 id="form-title">求职申请表</h3>
          <p>暂未添加字段</p>
        </section>
      </main>

      <aside class="editor-panel property-panel" aria-labelledby="property-title">
        <h2 id="property-title">字段属性</h2>
        <p class="panel-empty-state">请选择一个字段进行编辑</p>
      </aside>
    </div>
  </div>
</template>
