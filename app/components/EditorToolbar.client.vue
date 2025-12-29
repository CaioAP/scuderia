<template>
	<span class="ql-formats">
		<select
			v-tooltip.bottom="'Fonte'"
			class="ql-font"
		>
			<option selected></option>
			<option value="serif"></option>
			<option value="monospace"></option>
		</select>

		<select
			v-tooltip.bottom="'Tamanho'"
			class="ql-size"
		>
			<option value="small"></option>
			<option selected></option>
			<option value="large"></option>
			<option value="huge"></option>
		</select>
	</span>

	<span class="ql-formats">
		<button
			v-tooltip.bottom="'Negrito'"
			class="ql-bold"
		/>
		<button
			v-tooltip.bottom="'Itálico'"
			class="ql-italic"
		/>
		<button
			v-tooltip.bottom="'Sublinhado'"
			class="ql-underline"
		/>
		<button
			v-tooltip.bottom="'Cortado'"
			class="ql-strike"
		/>
	</span>

	<span class="ql-formats">
		<select
			v-tooltip.bottom="'Cor do texto'"
			class="ql-color"
		/>
		<select
			v-tooltip.bottom="'Cor de fundo'"
			class="ql-background"
		/>
	</span>

	<span class="ql-formats">
		<button
			v-tooltip.bottom="'Lista ordenada'"
			class="ql-list"
			value="ordered"
		/>
		<button
			v-tooltip.bottom="'Lista não ordenada'"
			class="ql-list"
			value="bullet"
		/>
	</span>

	<span class="ql-formats">
		<button
			v-tooltip.bottom="'Bloco de citação'"
			class="ql-blockquote"
		/>
		<button
			v-tooltip.bottom="'Bloco de código'"
			class="ql-code-block"
		/>
		<button
			v-tooltip.bottom="'Inserir link'"
			class="ql-link"
		/>
	</span>

	<span class="ql-formats">
		<button
			v-tooltip.bottom="'Limpar formatação'"
			class="ql-clean"
		/>
	</span>
</template>
